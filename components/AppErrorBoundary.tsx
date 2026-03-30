import React from 'react';
import SomethingWentWrong from '../pages/SomethingWentWrong';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('App error boundary caught an error:', error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <SomethingWentWrong onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
