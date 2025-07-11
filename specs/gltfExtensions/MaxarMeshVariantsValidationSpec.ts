import { validateGltf } from "./validateGltf";

describe("MAXAR_mesh_variants extension validation", function () {
  it("validates a valid mesh variants extension", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/meshVariants/ValidMeshVariants.gltf"
    );
    expect(result.length).toEqual(0);
  });

  it("detects missing variants property in root extension", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/meshVariants/RootVariantsMissing.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("PROPERTY_MISSING");
    expect(result.get(0).message).toContain("variants");
  });

  it("detects missing default property in root extension", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/meshVariants/RootDefaultMissing.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("PROPERTY_MISSING");
    expect(result.get(0).message).toContain("default");
  });

  it("detects default index out of range", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/meshVariants/RootDefaultOutOfRange.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("VALUE_NOT_IN_RANGE");
  });

  it("detects empty variant name", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/meshVariants/VariantNameEmpty.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("STRING_LENGTH_MISMATCH");
  });

  it("detects node extension without root extension", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/meshVariants/NodeWithoutRootExtension.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("INVALID_GLTF_STRUCTURE");
    expect(result.get(0).message).toContain(
      "root glTF object does not define the extension"
    );
  });

  it("detects missing mappings property in node extension", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/meshVariants/NodeMappingsMissing.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("PROPERTY_MISSING");
    expect(result.get(0).message).toContain("mappings");
  });

  it("detects mesh index out of range in mapping", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/meshVariants/MappingMeshOutOfRange.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("VALUE_NOT_IN_RANGE");
  });

  it("detects variant index out of range in mapping", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/meshVariants/MappingVariantOutOfRange.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("VALUE_NOT_IN_RANGE");
  });

  it("detects duplicate variant indices across mappings", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/meshVariants/DuplicateVariantIndices.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("VALUE_NOT_IN_LIST");
    expect(result.get(0).message).toContain("used in multiple mappings");
  });
});
