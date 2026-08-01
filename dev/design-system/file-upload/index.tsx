import { FileUpload } from '../../../src/components/FileUpload';
import { Section, Col } from '../shared/Section';

export const FileUploadShowcase = () => (
  <Col>
    <Section label="Default (single file)">
      <FileUpload onFilesAccepted={(files) => console.log('Accepted:', files)} />
    </Section>

    <Section label="Multiple files (max 5)">
      <FileUpload
        multiple
        maxFiles={5}
        onFilesAccepted={(files) => console.log('Accepted:', files)}
        onFilesRejected={(files, reason) => console.warn('Rejected:', reason, files)}
      />
    </Section>

    <Section label="Images only">
      <FileUpload
        accept="image/*"
        multiple
        onFilesAccepted={(files) => console.log('Images accepted:', files)}
      />
    </Section>

    <Section label="With size limit (2 MB)">
      <FileUpload
        maxSize={2 * 1024 * 1024}
        onFilesAccepted={(files) => console.log('Accepted:', files)}
        onFilesRejected={(_, reason) => console.warn('Rejected — reason:', reason)}
      />
    </Section>

    <Section label="Custom hint">
      <FileUpload
        accept=".pdf,.docx"
        hint="Upload your resume in PDF or DOCX format"
        onFilesAccepted={(files) => console.log('Resume:', files)}
      />
    </Section>

    <Section label="Disabled">
      <FileUpload disabled />
    </Section>
  </Col>
);
