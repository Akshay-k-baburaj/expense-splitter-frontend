import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GroupForm from "./GroupForm";
import { createGroup, getGroupErrorMessage } from "./groupService";
import type { GroupFormValues } from "./groupSchema";

export default function GroupCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function saveGroup(values: GroupFormValues) {
    setError("");
    try {
      const created = await createGroup(values);
      navigate(`/groups/${created.id}`, { state: { notice: "Group created. Open Settings to create a six-digit invite code for your group." } });
    } catch (requestError: unknown) {
      setError(getGroupErrorMessage(requestError, "save"));
    }
  }

  return (
    <main className="page-content group-create-page">
      <Link className="back-link group-back-link" to="/groups">← All groups</Link>
      <div className="group-create-heading">
        <p className="eyebrow">A shared space starts here</p>
        <h1 className="compact-title">Create a group<span className="title-period">.</span></h1>
        <p className="intro-copy">Give your shared plan a name. You can add its members once it’s created.</p>
      </div>
      <div className="group-create-layout">
        <section className="content-panel group-form-panel" aria-labelledby="create-group-title">
          <div className="panel-heading"><div><p className="eyebrow">The essentials</p><h2 id="create-group-title">Group details</h2></div></div>
          <GroupForm allowCurrencyChange submitLabel="Create group" onSave={saveGroup} errorMessage={error} />
        </section>
        <aside className="group-create-aside">
          <span className="aside-step">01 <span> / 02</span></span>
          <p className="eyebrow">First, set the scene</p>
          <h2>Make it easy<br />to recognize.</h2>
          <p>Choose a name your group will know, like “Weekend away” or “Flat expenses.” A short description can help everyone know what belongs here.</p>
          <div className="aside-next"><span>Next</span><strong>Invite your people</strong><p>After creating the group, open Settings to make a six-digit code they can enter on the Groups page.</p></div>
        </aside>
      </div>
    </main>
  );
}
