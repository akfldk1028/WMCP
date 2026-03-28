import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { A2UIRenderer } from './renderer';
import type { A2UIComponent } from './types';

describe('A2UIRenderer', () => {
  it('should render a Text component', () => {
    const components: A2UIComponent[] = [
      { id: 'msg', component: 'Text', text: 'Hello World' },
    ];
    render(<A2UIRenderer components={components} dataModel={{}} />);
    expect(screen.getByText('Hello World')).toBeDefined();
  });

  it('should render a TextField component', () => {
    const components: A2UIComponent[] = [
      { id: 'input', component: 'TextField', label: 'Your Name', placeholder: 'Enter name' },
    ];
    render(<A2UIRenderer components={components} dataModel={{}} />);
    expect(screen.getByLabelText('Your Name')).toBeDefined();
  });

  it('should render a Card with title', () => {
    const components: A2UIComponent[] = [
      { id: 'card', component: 'Card', title: 'My Card', children: ['card-text'] },
      { id: 'card-text', component: 'Text', text: 'Card content' },
    ];
    render(<A2UIRenderer components={components} dataModel={{}} />);
    expect(screen.getByText('My Card')).toBeDefined();
    expect(screen.getByText('Card content')).toBeDefined();
  });

  it('should resolve data refs from dataModel', () => {
    const components: A2UIComponent[] = [
      { id: 'msg', component: 'Text', text: { $ref: '/greeting' } },
    ];
    const dataModel = { greeting: 'Bound Value' };
    render(<A2UIRenderer components={components} dataModel={dataModel} />);
    expect(screen.getByText('Bound Value')).toBeDefined();
  });

  it('should skip unknown component types gracefully', () => {
    const components: A2UIComponent[] = [
      { id: 'unknown', component: 'FancyWidget', data: 'test' },
      { id: 'known', component: 'Text', text: 'Visible' },
    ];
    render(<A2UIRenderer components={components} dataModel={{}} />);
    expect(screen.getByText('Visible')).toBeDefined();
  });

  it('should render a Select component with options', () => {
    const components: A2UIComponent[] = [
      { id: 'sel', component: 'Select', label: 'Market', options: ['Niche', 'Mass', 'Segmented'] },
    ];
    render(<A2UIRenderer components={components} dataModel={{}} />);
    expect(screen.getByLabelText('Market')).toBeDefined();
  });

  it('should render a Button component', () => {
    const components: A2UIComponent[] = [
      { id: 'btn-text', component: 'Text', text: 'Click Me' },
      { id: 'btn', component: 'Button', child: 'btn-text' },
    ];
    render(<A2UIRenderer components={components} dataModel={{}} />);
    expect(screen.getByRole('button')).toBeDefined();
    expect(screen.getByText('Click Me')).toBeDefined();
  });
});
