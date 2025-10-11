import React from 'react';
import ReactDOM from 'react-dom/client';
import { Download, Plus, Trash2, Search, ChevronRight } from 'lucide-react';
import { Button, IconButton } from '../src/components/Button';
import { Tooltip } from '../src/components/Tooltip';
import '../src/styles/index.scss';
import './demo.scss';

function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="demo-container">
      <h1>Eidos UI - Component Preview</h1>

      <section>
        <h2>Button Variants</h2>
        <div className="button-group">
          <Button variant="filled" color="primary">Filled Primary</Button>
          <Button variant="filled" color="secondary">Filled Secondary</Button>
          <Button variant="filled" color="success">Success</Button>
          <Button variant="filled" color="danger">Danger</Button>
        </div>

        <div className="button-group">
          <Button variant="outlined" color="primary">Outlined</Button>
          <Button variant="outlined" color="secondary">Outlined</Button>
          <Button variant="outlined" color="success">Outlined</Button>
          <Button variant="outlined" color="danger">Outlined</Button>
        </div>

        <div className="button-group">
          <Button variant="text" color="primary">Text</Button>
          <Button variant="text" color="secondary">Text</Button>
          <Button variant="text" color="success">Text</Button>
          <Button variant="text" color="danger">Text</Button>
        </div>
      </section>

      <section>
        <h2>Button Sizes</h2>
        <div className="button-group">
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </div>
      </section>

      <section>
        <h2>Buttons with Icons</h2>
        <div className="button-group">
          <Button preIcon={Download}>Download</Button>
          <Button posIcon={ChevronRight}>Next</Button>
          <Button preIcon={Search} posIcon={ChevronRight}>Search</Button>
          <Button preIcon={Plus} color="success">Add New</Button>
        </div>
      </section>

      <section>
        <h2>Icon-Only Buttons</h2>
        <div className="button-group">
          <Button icon={Plus} size="small" />
          <Button icon={Download} size="medium" />
          <Button icon={Trash2} size="large" color="danger" variant="outlined" />
        </div>

        <h3 style={{ marginTop: '1rem', fontSize: '0.875rem', opacity: 0.7 }}>
          Using IconButton helper:
        </h3>
        <div className="button-group">
          <IconButton icon={Plus} size="small" />
          <IconButton icon={Download} size="medium" />
          <IconButton icon={Trash2} size="large" color="danger" variant="outlined" />
        </div>
      </section>

      <section>
        <h2>Button States</h2>
        <div className="button-group">
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button variant="outlined" disabled>Disabled Outlined</Button>
        </div>
      </section>

      <section>
        <h2>Buttons with Tooltips</h2>
        <div className="button-group">
          <Button
            preIcon={Download}
            tooltip="Download the file"
          >
            Download
          </Button>
          <Button
            icon={Plus}
            tooltip="Add new item"
            color="success"
          />
          <Button
            icon={Trash2}
            tooltip="Delete permanently"
            color="danger"
            variant="outlined"
          />
        </div>
      </section>

      <section>
        <h2>Tooltips</h2>
        <div className="button-group">
          <Tooltip message="This is a tooltip">
            <Button>Hover me</Button>
          </Tooltip>

          <Tooltip message="Click to toggle" trigger="click">
            <Button variant="outlined">Click me</Button>
          </Tooltip>

          <Tooltip message="Top placement" placement="top">
            <Button variant="text">Top</Button>
          </Tooltip>

          <Tooltip message="Right placement" placement="right">
            <Button variant="text">Right</Button>
          </Tooltip>
        </div>
      </section>

      <section>
        <h2>Interactive Example</h2>
        <div className="button-group">
          <Button
            preIcon={Plus}
            onClick={() => setCount(count + 1)}
            color="primary"
          >
            Clicked {count} times
          </Button>

          <Button
            icon={Trash2}
            onClick={() => setCount(0)}
            color="danger"
            variant="outlined"
            tooltip="Reset counter"
          />
        </div>
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
