import React from "react";
import { FormattedMessage } from "react-intl";

import { Message } from "components/ui/Message";

import { FormBuildError, isFormBuildError } from "core/form/FormBuildError";

import { EditorView } from "../types";

interface ApiErrorBoundaryState {
  error?: string | FormBuildError;
}

interface ApiErrorBoundaryProps {
  closeAndSwitchToYaml: () => void;
  currentView: EditorView;
}

export class ConfigMenuErrorBoundaryComponent extends React.Component<
  React.PropsWithChildren<ApiErrorBoundaryProps>,
  ApiErrorBoundaryState
> {
  state: ApiErrorBoundaryState = {};

  static getDerivedStateFromError(error: { message: string; __type?: string }): ApiErrorBoundaryState {
    if (isFormBuildError(error)) {
      return { error };
    }

    return { error: error.message };
  }
  render(): React.ReactNode {
    const { children, currentView, closeAndSwitchToYaml } = this.props;
    const { error } = this.state;

    if (!error) {
      return children;
    }
    return (
      <Message
        text={
          <>
            <FormattedMessage
              id="connectorBuilder.inputsError"
              values={{ error: typeof error === "string" ? error : <FormattedMessage id={error.message} /> }}
            />{" "}
            <a
              target="_blank"
              href="https://docs.airbyte.com/connector-development/connector-specification-reference"
              rel="noreferrer"
            >
              <FormattedMessage id="connectorBuilder.inputsErrorDocumentation" />
            </a>
          </>
        }
        type="error"
        actionBtnText={
          currentView === "ui" ? (
            <FormattedMessage id="connectorBuilder.goToYaml" />
          ) : (
            <FormattedMessage id="connectorBuilder.close" />
          )
        }
        onAction={closeAndSwitchToYaml}
      />
    );
  }
}
