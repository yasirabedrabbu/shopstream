"use client";
import{Action,Box,EmptyState}from"@/components/customer/ui";
export default function ErrorState({reset}:{error:Error;reset:()=>void}){return <Box className="p-panel" role="alert"><EmptyState icon="alert" title="Your account page couldn’t load" text="Try again to return to your sample account. No payment or production account was changed." action={<Action onClick={reset}>Try again</Action>}/></Box>;}
