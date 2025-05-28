import { describe, it, expect } from 'vitest';
import { 
  createXAxis, 
  createYAxis, 
  createGrid, 
  createTickAttributes 
} from '../../src/lib/brewing/axes.svelte.js';

describe('axes module', () => {
  const testScales = {
    x: null,
    y: null
  };
  
  const testDimensions = {
    width: 600,
    height: 400,
    margin: { top: 20, right: 30, bottom: 40, left: 50 },
    innerWidth: 520,
    innerHeight: 340
  };
  
  // Create mock scales
  beforeEach(() => {
    // Mock band scale for x-axis
    testScales.x = {
      domain: () => ['A', 'B', 'C'],
      bandwidth: () => 30,
      ticks: null,
      // Mock implementation
      call: (d) => d
    };
    
    testScales.x.bandwidth = () => 30;
    
    // Add custom method for band scales
    testScales.x = (value) => {
      const domain = ['A', 'B', 'C'];
      const index = domain.indexOf(value);
      if (index === -1) return 0;
      return index * 40;
    };
    
    testScales.x.domain = () => ['A', 'B', 'C'];
    testScales.x.bandwidth = () => 30;
    
    // Mock linear scale for y-axis with ticks
    testScales.y = (value) => {
      // Simple linear mapping: 0 -> 340, 100 -> 0
      return 340 - (value / 100) * 340;
    };
    
    testScales.y.domain = () => [0, 100];
    testScales.y.ticks = (count) => {
      // Generate n evenly spaced ticks from 0 to 100
      const n = count || 5;
      return Array.from({ length: n + 1 }, (_, i) => i * (100 / n));
    };
  });
  
  describe('createXAxis', () => {
    it('should create x-axis data for band scale', () => {
      const xAxis = createXAxis(testScales, testDimensions);
      
      expect(xAxis.ticks.length).toBe(3);
      expect(xAxis.transform).toBe(`translate(0, ${testDimensions.innerHeight})`);
      
      // Check first tick
      expect(xAxis.ticks[0].value).toBe('A');
      expect(xAxis.ticks[0].position).toBe(15); // 0 + bandwidth/2
      
      // Check second tick
      expect(xAxis.ticks[1].value).toBe('B');
      expect(xAxis.ticks[1].position).toBe(55); // 40 + bandwidth/2
    });
    
    it('should create x-axis with custom tick count', () => {
      // For band scale, custom tick count should filter ticks
      testScales.x.domain = () => ['A', 'B', 'C', 'D', 'E', 'F'];
      
      const xAxis = createXAxis(testScales, testDimensions, { tickCount: 2 });
      
      // Should show fewer ticks
      expect(xAxis.ticks.length).toBeLessThan(6);
      expect(xAxis.ticks.length).toBeGreaterThan(0);
    });
    
    it('should create x-axis with custom tick formatter', () => {
      const tickFormat = (value) => `Category ${value}`;
      const xAxis = createXAxis(testScales, testDimensions, { tickFormat });
      
      expect(xAxis.ticks[0].formattedValue).toBe('Category A');
    });
    
    it('should create x-axis with label', () => {
      const xAxis = createXAxis(testScales, testDimensions, { label: 'Categories' });
      
      expect(xAxis.label).toBe('Categories');
      expect(xAxis.labelTransform).toBe(`translate(${testDimensions.innerWidth / 2}, 35)`);
    });
    
    it('should return empty ticks if x scale is not defined', () => {
      const xAxis = createXAxis({ y: testScales.y }, testDimensions);
      
      expect(xAxis.ticks).toEqual([]);
    });
  });
  
  describe('createYAxis', () => {
    it('should create y-axis data for linear scale', () => {
      const yAxis = createYAxis(testScales, testDimensions);
      
      expect(yAxis.ticks.length).toBeGreaterThan(0);
      expect(yAxis.transform).toBe('translate(0, 0)');
      
      // Check tick positions
      yAxis.ticks.forEach(tick => {
        // Higher values should have lower y positions
        const expectedPosition = testScales.y(tick.value);
        expect(tick.position).toBe(expectedPosition);
      });
    });
    
    it('should create y-axis with custom tick count', () => {
      const yAxis = createYAxis(testScales, testDimensions, { tickCount: 3 });
      
      // Should have exactly the number of ticks specified + 1 (for zero)
      expect(yAxis.ticks.length).toBe(4);
      expect(yAxis.ticks[0].value).toBe(0);
      expect(yAxis.ticks[3].value).toBe(100);
    });
    
    it('should create y-axis with custom tick formatter', () => {
      const tickFormat = (value) => `${value}%`;
      const yAxis = createYAxis(testScales, testDimensions, { tickFormat });
      
      // Check that the formatter was applied
      yAxis.ticks.forEach(tick => {
        expect(tick.formattedValue).toBe(`${tick.value}%`);
      });
    });
    
    it('should create y-axis with label', () => {
      const yAxis = createYAxis(testScales, testDimensions, { label: 'Values' });
      
      expect(yAxis.label).toBe('Values');
      expect(yAxis.labelTransform).toBe(`translate(-40, ${testDimensions.innerHeight / 2}) rotate(-90)`);
    });
    
    it('should return empty ticks if y scale is not defined', () => {
      const yAxis = createYAxis({ x: testScales.x }, testDimensions);
      
      expect(yAxis.ticks).toEqual([]);
    });
  });
  
  describe('createGrid', () => {
    it('should create grid with both x and y lines', () => {
      const grid = createGrid(testScales, testDimensions);
      
      expect(grid.xLines.length).toBeGreaterThan(0);
      expect(grid.yLines.length).toBeGreaterThan(0);
      
      // Check a typical x grid line
      const xLine = grid.xLines[0];
      expect(xLine).toHaveProperty('x1');
      expect(xLine).toHaveProperty('y1');
      expect(xLine).toHaveProperty('x2');
      expect(xLine).toHaveProperty('y2');
      expect(xLine.y2).toBe(testDimensions.innerHeight);
      
      // Check a typical y grid line
      const yLine = grid.yLines[0];
      expect(yLine).toHaveProperty('x1');
      expect(yLine).toHaveProperty('y1');
      expect(yLine).toHaveProperty('x2');
      expect(yLine).toHaveProperty('y2');
      expect(yLine.x2).toBe(testDimensions.innerWidth);
    });
    
    it('should create grid with only x lines', () => {
      const grid = createGrid(testScales, testDimensions, { direction: 'x' });
      
      expect(grid.xLines.length).toBeGreaterThan(0);
      expect(grid.yLines.length).toBe(0);
    });
    
    it('should create grid with only y lines', () => {
      const grid = createGrid(testScales, testDimensions, { direction: 'y' });
      
      expect(grid.xLines.length).toBe(0);
      expect(grid.yLines.length).toBeGreaterThan(0);
    });
    
    it('should create grid with custom tick counts', () => {
      const grid = createGrid(testScales, testDimensions, { 
        xTickCount: 2,
        yTickCount: 3
      });
      
      // X lines should respect xTickCount (actual implementation may vary)
      expect(grid.xLines.length).toBeGreaterThan(0);
      
      // Y lines should have 3 + 1 lines (including zero)
      expect(grid.yLines.length).toBe(4);
    });
  });
  
  describe('createTickAttributes', () => {
    it('should create attributes for x-axis ticks', () => {
      const tick = { position: 100, value: 'A', formattedValue: 'A' };
      const attrs = createTickAttributes(tick, 'x');
      
      expect(attrs['data-plot-tick']).toBe('major');
      expect(attrs.transform).toBe('translate(100, 0)');
      expect(attrs['text-anchor']).toBe('middle');
    });
    
    it('should create attributes for y-axis ticks', () => {
      const tick = { position: 50, value: 50, formattedValue: '50' };
      const attrs = createTickAttributes(tick, 'y');
      
      expect(attrs['data-plot-tick']).toBe('major');
      expect(attrs.transform).toBe('translate(0, 50)');
      expect(attrs['text-anchor']).toBe('end');
      expect(attrs['dominant-baseline']).toBe('middle');
    });
  });
});