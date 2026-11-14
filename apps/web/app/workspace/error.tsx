"use client";
import { Action, Box, EmptyState } from "@/components/workspace/ui";
export default function WorkspaceError({reset}:{error:Error;reset:()=>void}){return <Box className="p-panel" role="alert"><EmptyState title="Your workspace couldn’t load" text="Try again to reload this page. No production store changes have been made." icon="alert" action={<Action onClick={reset}>Try again</Action>}/></Box>;}
