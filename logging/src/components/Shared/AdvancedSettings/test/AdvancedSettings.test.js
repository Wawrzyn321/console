import React from 'react';
import renderer from 'react-test-renderer';
import AdvancedSettings from './../AdvancedSettings';

const sampleAdvancedSettings = {
  query: 'query',
  resultLimit: 10,
  showPreviousLogs: true,
  showHealthChecks: true,
};

describe('AdvancedSettings', () => {
  it('Renders with minimal props', () => {
    const component = renderer.create(
      <AdvancedSettings
        advancedSettings={sampleAdvancedSettings}
        hideSettings={() => {}}
        updateFilteringState={() => {}}
      />,
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});