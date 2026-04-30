import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#f7faf7] p-6 text-slate-950">
          <section className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold text-red-600">Habit Quest could not start</p>
            <h1 className="mt-2 text-2xl font-bold">Frontend error</h1>
            <pre className="mt-4 overflow-auto rounded-lg bg-red-50 p-3 text-sm text-red-900">
              {this.state.error?.message ?? "Unknown error"}
            </pre>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
