import { describe, it, expect } from 'vitest';
import { createScales, getOrigin } from '../../src/lib/brewing/scales.svelte.js';

describe('scales module', () => {
  const testDimensions = {
    width: 600,
    height: 400,
    margin: { top: 20, right: 30, bottom: 40, left: 50 },
    innerWidth: 520,
    innerHeight: 340
  };
  
  describe('createScales', () => {
    it('should return empty scales object for empty data', () => {
      const scales = createScales([], { x: 'category', y: 'value' }, testDimensions);
      
      expect(scales.x).toBeNull();
      expect(scales.y).toBeNull();
      expect(scales.color).toBeNull();
    });
    
    it('should create band scale for categorical x-axis data', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
        { category: 'C', value: 30 }
      ];
      
      const scales = createScales(data, { x: 'category', y: 'value' }, testDimensions);
      
      expect(scales.x).not.toBeNull();
      expect(typeof scales.x).toBe('function');
      expect(scales.x.bandwidth).toBeDefined();
      expect(scales.x.domain()).toEqual(['A', 'B', 'C']);
      expect(scales.x.range()).toEqual([0, testDimensions.innerWidth]);
    });
    
    it('should create linear scale for numeric x-axis data', () => {
      const data = [
        { category: 10, value: 10 },
        { category: 20, value: 20 },
        { category: 30, value: 30 }
      ];
      
      const scales = createScales(data, { x: 'category', y: 'value' }, testDimensions);
      
      expect(scales.x).not.toBeNull();
      expect(typeof scales.x).toBe('function');
      expect(scales.x.ticks).toBeDefined();
      expect(scales.x(0)).toBeLessThan(scales.x(30));
    });
    
    it('should create time scale for date x-axis data', () => {
      const data = [
        { category: new Date(2023, 0, 1), value: 10 },
        { category: new Date(2023, 0, 2), value: 20 },
        { category: new Date(2023, 0, 3), value: 30 }
      ];
      
      const scales = createScales(data, { x: 'category', y: 'value' }, testDimensions);
      
      expect(scales.x).not.toBeNull();
      expect(typeof scales.x).toBe('function');
      expect(scales.x.ticks).toBeDefined();
      expect(scales.x(new Date(2023, 0, 1))).toBeLessThan(scales.x(new Date(2023, 0, 3)));
    });
    
    it('should create linear scale for y-axis data', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
        { category: 'C', value: 30 }
      ];
      
      const scales = createScales(data, { x: 'category', y: 'value' }, testDimensions);
      
      expect(scales.y).not.toBeNull();
      expect(typeof scales.y).toBe('function');
      expect(scales.y(0)).toBeGreaterThan(scales.y(30));
      expect(scales.y(0)).toBe(testDimensions.innerHeight);
      expect(scales.y.domain()[1]).toBeGreaterThanOrEqual(30); // Should add some padding
    });
    
    it('should create color scale when color field is provided', () => {
      const data = [
        { category: 'A', value: 10, group: 'Group 1' },
        { category: 'B', value: 20, group: 'Group 2' },
        { category: 'C', value: 30, group: 'Group 1' }
      ];
      
      const scales = createScales(
        data, 
        { x: 'category', y: 'value', color: 'group' }, 
        testDimensions
      );
      
      expect(scales.color).not.toBeNull();
      expect(typeof scales.color).toBe('function');
      expect(scales.color.domain()).toEqual(['Group 1', 'Group 2']);
      expect(scales.color('Group 1')).not.toBe(scales.color('Group 2'));
    });
    
    it('should not create color scale when color field is not provided', () => {
      const data = [
        { category: 'A', value: 10, group: 'Group 1' },
        { category: 'B', value: 20, group: 'Group 2' }
      ];
      
      const scales = createScales(
        data,
        { x: 'category', y: 'value' },
        testDimensions
      );
      
      expect(scales.color).toBeNull();
    });
    
    it('should use custom padding for band scales', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 }
      ];
      
      const defaultScales = createScales(data, { x: 'category', y: 'value' }, testDimensions);
      const customScales = createScales(
        data, 
        { x: 'category', y: 'value' }, 
        testDimensions,
        { padding: 0.5 }
      );
      
      expect(defaultScales.x.padding()).toBe(0.2); // Default padding
      expect(customScales.x.padding()).toBe(0.5);
    });
  });
  
  describe('getOrigin', () => {
    it('should return correct origin for linear scales', () => {
      const data = [
        { category: 'A', value: -10 },
        { category: 'B', value: 20 }
      ];
      
      const scales = createScales(data, { x: 'category', y: 'value' }, testDimensions);
      const origin = getOrigin(scales, testDimensions);
      
      expect(origin.x).toBe(scales.y(0));
      expect(origin.y).toBe(0);
    });
    
    it('should handle case when scales are not defined', () => {
      const origin = getOrigin({}, testDimensions);
      
      expect(origin.x).toBe(testDimensions.innerHeight);
      expect(origin.y).toBe(0);
    });
  });
});