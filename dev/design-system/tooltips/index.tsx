import { Info, Trash2 } from 'lucide-react';
import { Button, IconButton } from '../../../src/components/Button';
import { Tooltip } from '../../../src/components/Tooltip';
import { Section, Row, Grid } from '../shared/Section';

export const TooltipShowcase = () => (
  <Grid cols={3}>
    <Section label="Placements">
      <Row>
        <Tooltip message="Appears above" placement="top">
          <Button variant="outlined" size="small">Top</Button>
        </Tooltip>
        <Tooltip message="Appears below" placement="bottom">
          <Button variant="outlined" size="small">Bottom</Button>
        </Tooltip>
        <Tooltip message="Appears to the left" placement="left">
          <Button variant="outlined" size="small">Left</Button>
        </Tooltip>
        <Tooltip message="Appears to the right" placement="right">
          <Button variant="outlined" size="small">Right</Button>
        </Tooltip>
      </Row>
    </Section>

    <Section label="Triggers">
      <Row>
        <Tooltip message="Triggered on hover" triggerType="hover">
          <Button variant="outlined" size="small">Hover</Button>
        </Tooltip>
        <Tooltip message="Triggered on click - click again to dismiss" triggerType="click">
          <Button variant="outlined" size="small">Click</Button>
        </Tooltip>
        <Tooltip message="Triggered on focus - tab to this button" triggerType="focus">
          <Button variant="outlined" size="small">Focus</Button>
        </Tooltip>
      </Row>
    </Section>

    <Section label="Use Cases">
      <Row>
        <Tooltip message="This feature is in beta and availability may vary.">
          <IconButton icon={Info} variant="outlined" />
        </Tooltip>
        <Button
          color="danger"
          variant="outlined"
          size="small"
          preIcon={Trash2}
          tooltip="This action is permanent and cannot be undone."
          onClick={() => alert('Delete clicked')}
        >
          Delete
        </Button>
        <Button disabled tooltip="You don't have permission to perform this action.">
          Disabled Action
        </Button>
      </Row>
    </Section>
  </Grid>
);
