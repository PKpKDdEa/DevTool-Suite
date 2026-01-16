export type Language = 'CSharp' | 'Python';

function toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}



// C# Conversion Logic
function getCSharpType(value: any): string {
    if (value === null) return 'object';
    const type = typeof value;
    if (type === 'string') return 'string';
    if (type === 'number') return Number.isInteger(value) ? 'int' : 'double';
    if (type === 'boolean') return 'bool';
    if (Array.isArray(value)) {
        if (value.length === 0) return 'List<object>';
        const itemType = getCSharpType(value[0]);
        return `List<${itemType}>`;
    }
    if (type === 'object') return 'object'; // Placeholder, actual class name handled in generation
    return 'string';
}

export function jsonToCSharp(jsonObj: any, rootClassName: string = 'Root'): string {
    const classes: Map<string, string> = new Map();

    function generateClass(obj: any, className: string) {
        if (classes.has(className)) return;

        let classContent = `public class ${className}\n{\n`;
        const entries = Object.entries(obj);

        for (const [key, value] of entries) {
            const propertyName = toPascalCase(key);
            let type = getCSharpType(value);

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const nestedClassName = toPascalCase(key);
                type = nestedClassName;
                generateClass(value, nestedClassName);
            } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                const nestedClassName = toPascalCase(key.endsWith('s') ? key.slice(0, -1) : key + 'Item');
                type = `List<${nestedClassName}>`;
                generateClass(value[0], nestedClassName);
            }

            classContent += `    public ${type} ${propertyName} { get; set; }\n`;
        }
        classContent += `}`;
        classes.set(className, classContent);
    }

    try {
        const parsed = typeof jsonObj === 'string' ? JSON.parse(jsonObj) : jsonObj;
        if (typeof parsed !== 'object' || parsed === null) return '// Invalid JSON object';

        if (Array.isArray(parsed)) {
            if (parsed.length > 0 && typeof parsed[0] === 'object') {
                generateClass(parsed[0], rootClassName);
            } else {
                return '// Root is an array of primitives, cannot generate class';
            }
        } else {
            generateClass(parsed, rootClassName);
        }

        return Array.from(classes.values()).reverse().join('\n\n');
    } catch (e) {
        return `// Error parsing JSON: ${e}`;
    }
}

// Python Pydantic Conversion Logic
function getPythonType(value: any): string {
    if (value === null) return 'Any';
    const type = typeof value;
    if (type === 'string') return 'str';
    if (type === 'number') return 'float'; // Start with float for safety, could be int
    if (type === 'boolean') return 'bool';
    if (Array.isArray(value)) {
        if (value.length === 0) return 'List[Any]';
        return `List[${getPythonType(value[0])}]`;
    }
    return 'Any';
}

export function jsonToPythonPydantic(jsonObj: any, rootClassName: string = 'Root'): string {
    const classes: Map<string, string> = new Map();

    function generateModel(obj: any, className: string) {
        if (classes.has(className)) return;

        let classContent = `class ${className}(BaseModel):\n`;
        const entries = Object.entries(obj);

        if (entries.length === 0) {
            classContent += `    pass\n`;
            classes.set(className, classContent);
            return;
        }

        for (const [key, value] of entries) {
            let type = getPythonType(value);

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const nestedClassName = toPascalCase(key);
                type = nestedClassName;
                generateModel(value, nestedClassName);
            } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                const nestedClassName = toPascalCase(key.endsWith('s') ? key.slice(0, -1) : key + 'Item');
                type = `List[${nestedClassName}]`;
                generateModel(value[0], nestedClassName);
            }

            // Handle int specifically for Python
            if (typeof value === 'number' && Number.isInteger(value)) {
                if (type === 'float') type = 'int';
            }

            classContent += `    ${key}: ${type}\n`;
        }
        classes.set(className, classContent);
    }

    try {
        const parsed = typeof jsonObj === 'string' ? JSON.parse(jsonObj) : jsonObj;
        if (typeof parsed !== 'object' || parsed === null) return '# Invalid JSON object';

        let header = 'from typing import List, Optional, Any\nfrom pydantic import BaseModel\n\n';

        if (Array.isArray(parsed)) {
            if (parsed.length > 0 && typeof parsed[0] === 'object') {
                generateModel(parsed[0], rootClassName);
            } else {
                return '# Root is an array of primitives';
            }
        } else {
            generateModel(parsed, rootClassName);
        }

        return header + Array.from(classes.values()).reverse().join('\n\n');
    } catch (e) {
        return `# Error parsing JSON: ${e}`;
    }
}
