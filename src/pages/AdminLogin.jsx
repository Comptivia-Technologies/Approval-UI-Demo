import React from "react";

import ProductHubLoginForm from "../components/ProductHubLoginForm.jsx";

export default function AdminLogin() {
  return (
    <ProductHubLoginForm
      expectedRole="admin"
      title="Admin sign in"
      afterLoginPath="/admin/tasks"
      alternateLoginPath="/member-login"
      alternateLabel="Member?"
    />
  );
}
