import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'
import { tick } from 'svelte'
import Hello from '../src/Hello.svelte'

describe('Hello.svelte', () => {
  // TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
  beforeEach(() => cleanup())

  it('mounts', () => {
    const { container } = render(Hello, { count: 4 })
    expect(container).toBeTruthy()
    expect(container.innerHTML).toContain('4 x 2 = 8')
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('updates on button click', async () => {
    render(Hello, { count: 4 })
    const btn = screen.getByRole('button')
    const div = screen.getByText('4 x 2 = 8')
    await fireEvent.click(btn)
    expect(div.innerHTML).toBe('4 x 3 = 12')
    await fireEvent.click(btn)
    expect(div.innerHTML).toBe('4 x 4 = 16')
  })
})
