import { AlignLeft, AlignCenter, AlignRight, LayoutList, LayoutGrid, Table2 } from 'lucide-react';
import { Button, IconButton } from '../../../src/components/Button';
import { ButtonGroup } from '../../../src/components/ButtonGroup';
import { Section, Grid, Col } from '../shared/Section';

export const ButtonGroupShowcase = () => (
  <Col>
    <Grid cols={3}>
      <Section label="Variants">
        <Col>
          <ButtonGroup variant="outlined">
            <Button>Left</Button>
            <Button>Center</Button>
            <Button>Right</Button>
          </ButtonGroup>
          <ButtonGroup variant="filled">
            <Button>Left</Button>
            <Button>Center</Button>
            <Button>Right</Button>
          </ButtonGroup>
          <ButtonGroup variant="text">
            <Button>Left</Button>
            <Button>Center</Button>
            <Button>Right</Button>
          </ButtonGroup>
        </Col>
      </Section>

      <Section label="Sizes">
        <Col>
          <ButtonGroup variant="outlined" size="small">
            <Button>Small</Button>
            <Button>Group</Button>
          </ButtonGroup>
          <ButtonGroup variant="outlined" size="medium">
            <Button>Medium</Button>
            <Button>Group</Button>
          </ButtonGroup>
          <ButtonGroup variant="outlined" size="large">
            <Button>Large</Button>
            <Button>Group</Button>
          </ButtonGroup>
        </Col>
      </Section>

      <Section label="Icon-only">
        <Col>
          <ButtonGroup variant="outlined">
            <IconButton icon={AlignLeft} tooltip="Align left" />
            <IconButton icon={AlignCenter} tooltip="Align center" />
            <IconButton icon={AlignRight} tooltip="Align right" />
          </ButtonGroup>
          <ButtonGroup variant="filled" color="primary">
            <IconButton icon={LayoutList} tooltip="List view" />
            <IconButton icon={LayoutGrid} tooltip="Grid view" />
            <IconButton icon={Table2} tooltip="Table view" />
          </ButtonGroup>
        </Col>
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="Vertical">
        <ButtonGroup variant="outlined" orientation="vertical">
          <Button>Top</Button>
          <Button>Middle</Button>
          <Button>Bottom</Button>
        </ButtonGroup>
      </Section>

      <Section label="Per-child override">
        <ButtonGroup variant="outlined" color="primary">
          <Button>Default</Button>
          <Button color="danger">Danger override</Button>
          <Button>Default</Button>
        </ButtonGroup>
      </Section>
    </Grid>
  </Col>
);
