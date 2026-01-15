import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function RegexExplainer() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Regex Explainer</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Explain Regular Expressions</CardTitle>
                    <CardDescription>Paste a regex pattern to see a breakdown of how it works.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Analysis tool will go here...</p>
                </CardContent>
            </Card>
        </div>
    )
}
