import React from "react";

import ProductHubLoginForm from "../components/ProductHubLoginForm.jsx";

export default function MemberLogin() {
  return (
    <ProductHubLoginForm
      expectedRole="member"
      title="Member sign in"
      afterLoginPath="/member/my-tasks"
      alternateLoginPath="/admin-login"
      alternateLabel="Admin?"
    />
  );
}
