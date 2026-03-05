import { auth } from '@/server/auth'

export default async function ManagementDashboard(): Promise<JSX.Element> {
    const session = await auth()
    return (
        <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome, {session?.user.email}</p>
            <p className="text-muted-foreground">Role: {session?.user.portalType}</p>
            <p className="text-muted-foreground">School: {session?.user.institutionName}</p>
            <p className="text-muted-foreground">Permissions: {session?.user.permissions.length} features enabled</p>
        </div>
    )
}
