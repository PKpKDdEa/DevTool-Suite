import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function CommitGenerator() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Commit Generator</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Generate Commit Message</CardTitle>
                    <CardDescription>Enter your changes to generate a conventional commit message.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Form will go here...</p>
                </CardContent>
            </Card>
        </div>
    )
}
