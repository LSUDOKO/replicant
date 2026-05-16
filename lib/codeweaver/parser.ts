import { parse, visit } from "@solidity-parser/parser";
import type {
  SourceUnit,
  ContractDefinition,
  FunctionDefinition,
  StateVariableDeclaration,
  StructDefinition,
  EnumDefinition,
  ModifierDefinition,
  EventDefinition,
  VariableDeclaration,
  StateVariableDeclarationVariable,
  Mapping,
} from "@solidity-parser/parser/dist/src/ast-types";
import type {
  ContractInfo,
  FunctionInfo,
  StateVariableInfo,
  MappingInfo,
} from "./types";

function typeNameToString(tn: any): string {
  if (!tn) return "unknown";
  switch (tn.type) {
    case "ElementaryTypeName": return tn.name || "unknown";
    case "UserDefinedTypeName": return tn.namePath || tn.name || "unknown";
    case "ArrayTypeName": return `${typeNameToString(tn.baseTypeName)}[]`;
    case "Mapping": return `mapping(${typeNameToString(tn.keyType)} => ${typeNameToString(tn.valueType)})`;
    case "FunctionTypeName": return "function";
    default: return tn.name || tn.type || "unknown";
  }
}

function extractMappingInfo(varDecl: VariableDeclaration, source: string): MappingInfo | null {
  const tn = varDecl.typeName;
  if (!tn || tn.type !== "Mapping") return null;
  const mapping = tn as Mapping;
  return {
    name: varDecl.name || "",
    keyType: typeNameToString(mapping.keyType),
    valueType: typeNameToString(mapping.valueType),
    line: varDecl.loc?.start?.line || 0,
  };
}

export class SolidityParser {
  parse(source: string, contractName?: string): ContractInfo {
    let ast: SourceUnit;
    try {
      const result = parse(source, { loc: true, range: true });
      ast = result;
    } catch (err) {
      throw new Error(
        `Failed to parse Solidity source: ${
          err instanceof Error ? err.message : "Parse error"
        }`
      );
    }

    const info: ContractInfo = {
      name: contractName || "Unknown",
      pragma: "",
      imports: [],
      functions: [],
      modifiers: [],
      events: [],
      stateVariables: [],
      mappings: [],
      inheritance: [],
      lines: source.split("\n").length,
    };

    visit(ast, {
      PragmaDirective: (node) => {
        info.pragma = node.value || "";
      },
      ImportDirective: (node) => {
        info.imports.push(node.path || "");
      },
      ContractDefinition: (node: ContractDefinition) => {
        if (!contractName || info.name === "Unknown") {
          info.name = node.name;
        }
        if (node.name === info.name || !contractName) {
          info.inheritance = (node.baseContracts || []).map(
            (b) => b.baseName?.namePath || ""
          );

          for (const sub of node.subNodes) {
            if (sub.type === "StateVariableDeclaration") {
              const decl = sub as StateVariableDeclaration;
              for (const varDecl of decl.variables) {
                const sv: StateVariableInfo = {
                  name: varDecl.name || "",
                  type: typeNameToString(varDecl.typeName),
                  visibility: (varDecl.visibility as StateVariableInfo["visibility"]) || "internal",
                  constant: !!varDecl.isDeclaredConst,
                  line: varDecl.loc?.start?.line || 0,
                };
                info.stateVariables.push(sv);

                const mappingInfo = extractMappingInfo(varDecl, source);
                if (mappingInfo) {
                  info.mappings.push(mappingInfo);
                }
              }
            }

            if (sub.type === "StructDefinition") {
              info.events.push(`struct ${(sub as StructDefinition).name}`);
            }

            if (sub.type === "EnumDefinition") {
              info.events.push(`enum ${(sub as EnumDefinition).name}`);
            }
          }
        }
      },
      FunctionDefinition: (node: FunctionDefinition) => {
        const fn: FunctionInfo = {
          name: node.name || "(fallback)",
          visibility: (node.visibility as FunctionInfo["visibility"]) || "internal",
          mutability: (node.stateMutability as FunctionInfo["mutability"]) || "nonpayable",
          modifiers: (node.modifiers || []).map((m) => m.name || ""),
          params: (node.parameters || []).map((p) => ({
            name: p.name || "",
            type: typeNameToString(p.typeName),
          })),
          returns: (node.returnParameters || []).map((p) => ({
            name: p.name || "",
            type: typeNameToString(p.typeName),
          })),
          lineStart: node.loc?.start?.line || 0,
          lineEnd: node.loc?.end?.line || 0,
          body: source.split("\n").slice(
            (node.loc?.start?.line || 1) - 1,
            node.loc?.end?.line || 1
          ).join("\n"),
        };
        info.functions.push(fn);
      },
      ModifierDefinition: (node: ModifierDefinition) => {
        info.modifiers.push(node.name);
      },
      EventDefinition: (node: EventDefinition) => {
        info.events.push(node.name);
      },
    });

    return info;
  }

  extractLines(source: string, startLine: number, endLine: number): string {
    const lines = source.split("\n");
    return lines.slice(Math.max(0, startLine - 1), endLine).join("\n");
  }
}
