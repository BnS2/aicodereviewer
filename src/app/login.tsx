import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return (
    <div className="flex min-hscreen items-center justify-center">
      <div>
        <h1>Login</h1>
      </div>
    </div>
  );
}
