"use client";

import { useState } from "react";
import type { PassportDocument, DocumentType } from "@/lib/types";

interface Props {
  documents: PassportDocument[];
  onUpload: (type: DocumentType, file: File) => Promise<void>;
  onToggleConsent: (type: DocumentType, field: "consentGiven" | "shareWithPartners") => void;
  onShare: () => Promise<string>;
  onDelete: (type: DocumentType) => Promise<void>;
}

function statusLabel(status: PassportDocument["status"]): string {
  switch (status) {
    case "verified":      return "Verified";
    case "uploaded":      return "Pending Review";
    case "needs-review":  return "Needs Review";
    default:              return "Not uploaded";
  }
}

export default function PassportView({ documents, onUpload, onToggleConsent, onShare, onDelete }: Props) {
  const [expanded,   setExpanded]   = useState<DocumentType | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copying,    setCopying]    = useState(false);

  const completedCount = documents.filter(
    d => d.status === "verified" || d.status === "uploaded",
  ).length;
  const completionPct = Math.round((completedCount / documents.length) * 100);

  async function handleShare() {
    const token = await onShare();
    setShareToken(token);
  }

  async function handleCopy() {
    if (!shareToken) return;
    await navigator.clipboard.writeText(shareToken);
    setCopying(true);
    setTimeout(() => setCopying(false), 1500);
  }

  return (
    <div className="view-grid">
      <article className="panel large-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Auto Insurance Passport</p>
            <h3>Evidence that tells your full driving story</h3>
          </div>
          <span className={`status-pill${completionPct >= 80 ? " success" : completionPct >= 40 ? "" : " warning"}`}>
            {completionPct}% complete
          </span>
        </div>

        <div className="progress-track" style={{ marginBottom: "1.5rem" }}>
          <span style={{ width: `${completionPct}%` }} />
        </div>

        <div className="passport-grid">
          {documents.map(doc => (
            <button
              key={doc.type}
              type="button"
              className={[
                "passport-tile",
                (doc.status === "verified" || doc.status === "uploaded") ? "complete" : "",
                expanded === doc.type ? "expanded" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => setExpanded(expanded === doc.type ? null : doc.type)}
            >
              <span>{doc.label}</span>
              <span className="passport-tile-meta">{statusLabel(doc.status)}</span>
              {doc.fileName && (
                <span className="passport-tile-filename">{doc.fileName}</span>
              )}
            </button>
          ))}
        </div>

        {expanded && (() => {
          const doc = documents.find(d => d.type === expanded)!;
          return (
            <div className="passport-expanded-panel">
              <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{doc.description}</p>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <label className="doc-upload-btn">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={async e => {
                      const f = e.target.files?.[0];
                      if (f) await onUpload(doc.type, f);
                    }}
                  />
                  + Upload document
                </label>

                {(doc.status === "uploaded" || doc.status === "verified") && (
                  <button
                    type="button"
                    className="passport-delete-btn"
                    onClick={() => onDelete(doc.type)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <label className="passport-consent-row">
                <input
                  type="checkbox"
                  checked={doc.consentGiven}
                  onChange={() => onToggleConsent(doc.type, "consentGiven")}
                />
                <span>I consent to AI processing of this document</span>
              </label>

              {doc.consentGiven && (
                <label className="passport-consent-row">
                  <input
                    type="checkbox"
                    checked={doc.shareWithPartners}
                    onChange={() => onToggleConsent(doc.type, "shareWithPartners")}
                  />
                  <span>Share with partner carriers for quoting</span>
                </label>
              )}
            </div>
          );
        })()}

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="primary-button" type="button" onClick={handleShare}>
            Share Passport with Agent
          </button>
        </div>

        {shareToken && (
          <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid var(--line)", borderRadius: "var(--radius)", background: "rgba(0,0,0,0.18)", display: "grid", gap: "0.5rem" }}>
            <p className="eyebrow">Share code</p>
            <div className="share-token">{shareToken}</div>
            <p style={{ color: "var(--muted)", fontSize: "0.78rem", margin: 0 }}>
              Give this code to your licensed agent. Expires in 48 hours.
            </p>
            <button
              type="button"
              className="secondary-button"
              style={{ width: "fit-content" }}
              onClick={handleCopy}
            >
              {copying ? "Copied!" : "Copy code"}
            </button>
          </div>
        )}
      </article>

      <article className="panel">
        <p className="eyebrow">Privacy</p>
        <h3>User controlled</h3>
        <p className="muted" style={{ lineHeight: 1.55, marginTop: "0.5rem" }}>
          Immigration documents are optional. FairDrive asks for explicit consent before
          any AI processing or partner sharing. Country of birth is never used as a
          pricing factor. You can delete any document at any time.
        </p>
        <div style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
          <div className="metric-row">
            <span>Documents uploaded</span>
            <strong>{completedCount} / {documents.length}</strong>
          </div>
          <div className="metric-row">
            <span>Partner sharing enabled</span>
            <strong>{documents.filter(d => d.shareWithPartners).length} docs</strong>
          </div>
        </div>
      </article>
    </div>
  );
}
