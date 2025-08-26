import { validateGltf } from "./validateGltf";

describe("KHR_texture_basisu extension validation", function () {
  it("detects no issues in validKhrTextureBasisu", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/khrTextureBasisu/validKhrTextureBasisu.gltf"
    );
    expect(result.length).toEqual(0);
  });

  it("detects missing source property", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/khrTextureBasisu/invalidSourceMissing.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("PROPERTY_MISSING");
  });

  it("detects source index out of range", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/khrTextureBasisu/invalidSourceOutOfRange.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("VALUE_NOT_IN_RANGE");
  });

  it("detects no issues with proper ktx2 mimeType", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/khrTextureBasisu/validWithKtx2MimeType.gltf"
    );
    expect(result.length).toEqual(0);
  });

  it("detects no issues when extension is not used", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/khrTextureBasisu/noExtension.gltf"
    );
    expect(result.length).toEqual(0);
  });

  it("detects warning for unexpected mimeType", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/khrTextureBasisu/warningUnexpectedMimeType.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("TEXTURE_BASISU_UNEXPECTED_MIME_TYPE");
    expect(result.get(0).severity).toEqual("WARNING");
  });

  it("detects invalid source type", async function () {
    const result = await validateGltf(
      "./specs/data/gltfExtensions/khrTextureBasisu/invalidSourceType.gltf"
    );
    expect(result.length).toEqual(1);
    expect(result.get(0).type).toEqual("TYPE_MISMATCH");
  });
});
