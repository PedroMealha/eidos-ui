import { Avatar, AvatarGroup } from '../../../src/components/Avatar';
import { Section, Grid, Col, Row } from '../shared/Section';

const COLORS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'gray'] as const;

export const AvatarShowcase = () => (
  <Col>
    <Grid cols={3}>
      <Section label="Image">
        <Row>
          <Avatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
          <Avatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
          <Avatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
        </Row>
      </Section>

      <Section label="Initials">
        <Row>
          <Avatar name="Alice Johnson" />
          <Avatar name="Bob Smith" />
          <Avatar name="Pedro" />
          <Avatar name="X" />
        </Row>
      </Section>

      <Section label="Fallback">
        <Row>
          <Avatar />
          <Avatar src="not-a-real-url.jpg" />
          <Avatar src="not-a-real-url.jpg" name="Fallback Name" />
        </Row>
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="Sizes">
        <Row>
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <Avatar key={s} name="John Doe" size={s} />
          ))}
        </Row>
      </Section>

      <Section label="Shapes">
        <Row>
          <Avatar name="Circle" shape="circle" />
          <Avatar name="Square" shape="square" />
          <Avatar src="https://i.pravatar.cc/150?img=5" shape="circle" />
          <Avatar src="https://i.pravatar.cc/150?img=5" shape="square" />
        </Row>
      </Section>
    </Grid>

    <Section label="Colors">
      <Row>
        {COLORS.map((c) => (
          <Avatar key={c} name={c} color={c} />
        ))}
      </Row>
    </Section>

    <Grid cols={2}>
      <Section label="Avatar Group">
        <AvatarGroup max={4}>
          <Avatar name="Alice Johnson" />
          <Avatar name="Bob Smith" />
          <Avatar name="Carol White" />
          <Avatar name="David Lee" />
          <Avatar name="Eva Chen" />
          <Avatar name="Frank Kim" />
        </AvatarGroup>
      </Section>

      <Section label="Group sizes">
        <Col gap="0.75rem">
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <AvatarGroup key={s} size={s} max={4}>
              <Avatar name="Alice J" />
              <Avatar name="Bob S" />
              <Avatar name="Carol W" />
              <Avatar name="David L" />
              <Avatar name="Eva C" />
            </AvatarGroup>
          ))}
        </Col>
      </Section>
    </Grid>

    <Section label="Clickable">
      <Row>
        <Avatar name="Click Me" onClick={() => alert('Avatar clicked!')} />
        <Avatar src="https://i.pravatar.cc/150?img=7" onClick={() => alert('Image avatar clicked!')} />
      </Row>
    </Section>
  </Col>
);
