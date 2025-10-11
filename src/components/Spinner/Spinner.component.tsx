import React from "react";
import { Loader2 } from "lucide-react";

export const Spinner: React.FC = () => (
  <div className="eidos-spinner-wrapper">
    <Loader2 className="eidos-spinner" />
  </div>
);
