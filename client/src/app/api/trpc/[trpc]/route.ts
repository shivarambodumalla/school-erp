// tRPC API handler placeholder
// Will be configured when tRPC router is set up
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
    return NextResponse.json({ message: 'tRPC endpoint' })
}

export async function POST(): Promise<NextResponse> {
    return NextResponse.json({ message: 'tRPC endpoint' })
}
