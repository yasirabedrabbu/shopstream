"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError, vendorApi } from "@/lib/api";
import type { VendorResponse } from "@/lib/types";
import { Field } from "@/components/platform/ui";
import {
  Action,
  Box,
  FormSection,
  MultilineField,
  Panel,
  PlatformLink,
  Screen,
  Text,
  WorkspaceIcon,
} from "./ui";

const STATUS_TEXT: Record<string, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
};

const NAME_MAX = 120;
const DESCRIPTION_MAX = 2000;

export function StoreSettingsScreen() {
  const [store, setStore] = useState<VendorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savedDescription, setSavedDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function applyStore(s: VendorResponse) {
    setStore(s);
    setName(s.storeName);
    setDescription(s.description ?? "");
    setSavedName(s.storeName);
    setSavedDescription(s.description ?? "");
  }

  useEffect(() => {
    let cancelled = false;
    vendorApi
      .store()
      .then((s) => {
        if (!cancelled) applyStore(s);
      })
      .catch((err) => {
        if (cancelled) return;
        // 404 means the vendor has no store yet, so show the create form.
        if (err instanceof ApiError && err.status === 404) {
          setStore(null);
        } else {
          setLoadError(err instanceof Error ? err.message : "Your store could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = name.trim() !== savedName.trim() || description.trim() !== savedDescription.trim();

  function cancel() {
    setName(savedName);
    setDescription(savedDescription);
    setError("");
    setSaved(false);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const storeName = name.trim();
    const desc = description.trim();

    if (!storeName) {
      setError("Enter your store name.");
      return;
    }
    if (storeName.length > NAME_MAX) {
      setError(`Store name must be ${NAME_MAX} characters or fewer.`);
      return;
    }
    if (desc.length > DESCRIPTION_MAX) {
      setError(`Description must be ${DESCRIPTION_MAX} characters or fewer.`);
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);
    try {
      // Send "" for an empty description so the server clears it.
      const body = { storeName, description: desc };
      const next = store ? await vendorApi.updateStore(body) : await vendorApi.createStore(body);
      applyStore(next);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your store could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      frame="workspace/settings/store"
      title="Store settings"
      subtitle="A few thoughtful details make your store feel like you."
      actions={
        store ? (
          <Text variant="small" tone="muted">
            Status: {STATUS_TEXT[store.status] ?? store.status}
          </Text>
        ) : undefined
      }
      emptyTitle="Make this space your own"
      emptyText="Start with your store name and a short description."
      emptyAction={<Action variant="primary">Set up store</Action>}
    >
      {loading && (
        <Text role="status" tone="muted">
          Loading your store…
        </Text>
      )}

      {loadError && (
        <Box className="p-settings-error" role="alert">
          <Text>{loadError}</Text>
        </Box>
      )}

      {!loading && !loadError && (
        <Box className="w-settings-layout">
          <Box as="form" className="w-settings-form" onSubmit={save}>
            <FormSection
              title={store ? "Store profile" : "Set up your store"}
              subtitle={
                store
                  ? "The essentials that tell customers who you are."
                  : "Create your store to start listing products."
              }
            >
              <Box className="w-form-fields">
                <Field
                  label="Store name"
                  required
                  maxLength={NAME_MAX}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSaved(false);
                  }}
                />
                <MultilineField
                  label="Store description"
                  rows={4}
                  maxLength={DESCRIPTION_MAX}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setSaved(false);
                  }}
                  helper={`${description.length}/${DESCRIPTION_MAX} characters · A short introduction to your store`}
                />
              </Box>
            </FormSection>

            {error && (
              <Box className="p-settings-error" role="alert">
                <Text>{error}</Text>
              </Box>
            )}

            {saved && !dirty && (
              <Box role="status" className="w-inline-success">
                <WorkspaceIcon name="checkCircle" />
                <Text>{store ? "Store saved." : "Store created."}</Text>
              </Box>
            )}

            <Box className="w-settings-save">
              <Box>
                <Text>{dirty ? "A few changes are waiting." : "You’re up to date."}</Text>
              </Box>
              <Box className="p-action-row">
                <Action disabled={!dirty || saving} onClick={cancel}>
                  Cancel changes
                </Action>
                <Action variant="primary" type="submit" disabled={saving || (!!store && !dirty)}>
                  <WorkspaceIcon name="check" size={16} />
                  {saving ? "Saving…" : store ? "Save changes" : "Create store"}
                </Action>
              </Box>
            </Box>
          </Box>

          <Box className="w-settings-aside">
            <Panel title="Your store at a glance" subtitle="How your saved profile appears">
              <Box className="w-profile-copy">
                <Text as="h2" variant="heading">
                  {savedName || "Your store name"}
                </Text>
                <Text variant="small" tone="muted">
                  {savedDescription || "Add a description so customers know what you sell."}
                </Text>
                {store && (
                  <PlatformLink href={`/stores/${store.slug}`} className="p-text-link">
                    View public store
                    <WorkspaceIcon name="arrowRight" size={14} />
                  </PlatformLink>
                )}
              </Box>
            </Panel>
          </Box>
        </Box>
      )}
    </Screen>
  );
}