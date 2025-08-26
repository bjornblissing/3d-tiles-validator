import { defined } from "3d-tiles-tools";

import { ValidationContext } from "../../ValidationContext";
import { BasicValidator } from "../../BasicValidator";
import { ValidationIssue } from "../../ValidationIssue";
import { ValidationIssueSeverity } from "../../ValidationIssueSeverity";

import { GltfData } from "../GltfData";

/**
 * A class for validating the `KHR_texture_basisu` extension in
 * glTF assets.
 *
 * This class assumes that the structure of the glTF asset itself
 * has already been validated (e.g. with the glTF Validator).
 *
 * @internal
 */
export class KhrTextureBasisuValidator {
  /**
   * Performs the validation to ensure that the `KHR_texture_basisu`
   * extensions in the given glTF are valid
   *
   * @param path - The path for validation issues
   * @param gltfData - The glTF data, containing the parsed JSON and the
   * (optional) binary buffer
   * @param context - The `ValidationContext` that any issues will be added to
   * @returns Whether the object was valid
   */
  static async validateGltf(
    path: string,
    gltfData: GltfData,
    context: ValidationContext
  ): Promise<boolean> {
    const gltf = gltfData.gltf;

    // Check if the extension is used
    const extensionsUsed = gltf.extensionsUsed;
    if (!extensionsUsed || !extensionsUsed.includes("KHR_texture_basisu")) {
      return true; // Extension not used, nothing to validate
    }

    let result = true;

    // Validate KHR_texture_basisu extensions in textures
    const textures = gltf.textures;
    if (defined(textures)) {
      for (let i = 0; i < textures.length; i++) {
        const texture = textures[i];
        if (
          defined(texture.extensions) &&
          defined(texture.extensions.KHR_texture_basisu)
        ) {
          const texturePath = path + "/textures/" + i;
          const extensionPath = texturePath + "/extensions/KHR_texture_basisu";

          if (
            !KhrTextureBasisuValidator.validateKhrTextureBasisu(
              extensionPath,
              texture.extensions.KHR_texture_basisu,
              gltf,
              context
            )
          ) {
            result = false;
          }
        }
      }
    }

    return result;
  }

  /**
   * Validates a KHR_texture_basisu extension object
   *
   * @param path - The path for ValidationIssue instances
   * @param khrTextureBasisu - The KHR_texture_basisu object to validate
   * @param gltf - The glTF root object for reference validation
   * @param context - The ValidationContext that any issues will be added to
   * @returns Whether the object was valid
   */
  private static validateKhrTextureBasisu(
    path: string,
    khrTextureBasisu: any,
    gltf: any,
    context: ValidationContext
  ): boolean {
    // Make sure that the given value is an object
    if (
      !BasicValidator.validateObject(
        path,
        "KHR_texture_basisu",
        khrTextureBasisu,
        context
      )
    ) {
      return false;
    }

    let result = true;

    // Validate the source property (required)
    const source = khrTextureBasisu.source;
    const sourcePath = path + "/source";

    // The source MUST be defined
    if (
      !BasicValidator.validateDefined(sourcePath, "source", source, context)
    ) {
      return false;
    }

    // Get the images array to validate the source index
    const images = gltf.images || [];
    const numImages = images.length;

    // The source MUST be an integer in [0, numImages)
    if (
      !BasicValidator.validateIntegerRange(
        sourcePath,
        "source",
        source,
        0,
        true,
        numImages,
        false,
        context
      )
    ) {
      result = false;
    } else {
      // If the source index is valid, optionally validate the referenced image
      const referencedImage = images[source];
      if (defined(referencedImage)) {
        if (
          !KhrTextureBasisuValidator.validateReferencedImage(
            sourcePath,
            referencedImage,
            context
          )
        ) {
          result = false;
        }
      }
    }

    return result;
  }

  /**
   * Validates the image referenced by the KHR_texture_basisu extension
   *
   * @param path - The path for ValidationIssue instances
   * @param image - The image object to validate
   * @param context - The ValidationContext that any issues will be added to
   * @returns Whether the image was valid for use with KHR_texture_basisu
   */
  private static validateReferencedImage(
    path: string,
    image: any,
    context: ValidationContext
  ): boolean {
    // If the image has a mimeType, it should be 'image/ktx2' for KTX v2 images
    // This is particularly relevant for GLB format where images are embedded
    const mimeType = image.mimeType;
    if (defined(mimeType) && mimeType !== "image/ktx2") {
      // This is a warning rather than an error, as the extension can work
      // with other formats, but KTX v2 is the intended format
      const message =
        `Image referenced by KHR_texture_basisu has mimeType '${mimeType}', ` +
        `but 'image/ktx2' is expected for KTX v2 images with Basis Universal supercompression`;
      const issue = new ValidationIssue(
        "TEXTURE_BASISU_UNEXPECTED_MIME_TYPE",
        path,
        message,
        ValidationIssueSeverity.WARNING
      );
      context.addIssue(issue);
    }

    return true;
  }
}
