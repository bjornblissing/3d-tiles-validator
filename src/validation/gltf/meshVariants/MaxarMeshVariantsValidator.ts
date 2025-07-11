import { defined } from "3d-tiles-tools";

import { ValidationContext } from "../../ValidationContext";
import { BasicValidator } from "../../BasicValidator";

import { GltfData } from "../GltfData";

import { GltfExtensionValidationIssues } from "../../../issues/GltfExtensionValidationIssues";
import { JsonValidationIssues } from "../../../issues/JsonValidationIssues";

/**
 * A class for validating the `MAXAR_mesh_variants` extension in
 * glTF assets.
 *
 * This class assumes that the structure of the glTF asset itself
 * has already been validated (e.g. with the glTF Validator).
 *
 * @internal
 */
export class MaxarMeshVariantsValidator {
  /**
   * Performs the validation to ensure that the `MAXAR_mesh_variants`
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

    let result = true;

    // Check if the MAXAR_mesh_variants extension object
    // at the root level is present and valid
    const rootExtensions = gltf.extensions;
    if (defined(rootExtensions)) {
      const meshVariants = rootExtensions["MAXAR_mesh_variants"];
      if (defined(meshVariants)) {
        const rootExtensionObjectIsValid =
          MaxarMeshVariantsValidator.validateRootMeshVariants(
            path + "/extensions/MAXAR_mesh_variants",
            meshVariants,
            context
          );
        if (!rootExtensionObjectIsValid) {
          result = false;
        }
      }
    }

    // Check if any nodes contain MAXAR_mesh_variants extensions
    const nodes = gltf.nodes;
    if (defined(nodes)) {
      for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
        const node = nodes[nodeIndex];
        const nodePath = path + "/nodes/" + nodeIndex;
        const extensions = node.extensions;
        if (defined(extensions)) {
          const nodeMeshVariants = extensions["MAXAR_mesh_variants"];
          if (defined(nodeMeshVariants)) {
            // Validate that the root extension exists
            if (!defined(rootExtensions?.["MAXAR_mesh_variants"])) {
              const message =
                `Node contains 'MAXAR_mesh_variants' extension but the ` +
                `root glTF object does not define the extension`;
              const issue =
                GltfExtensionValidationIssues.INVALID_GLTF_STRUCTURE(
                  nodePath,
                  message
                );
              context.addIssue(issue);
              result = false;
            } else {
              const nodeExtensionObjectIsValid =
                MaxarMeshVariantsValidator.validateNodeMeshVariants(
                  nodePath + "/extensions/MAXAR_mesh_variants",
                  nodeMeshVariants,
                  rootExtensions["MAXAR_mesh_variants"],
                  gltf,
                  context
                );
              if (!nodeExtensionObjectIsValid) {
                result = false;
              }
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Validate the root-level MAXAR_mesh_variants extension object
   *
   * @param path - The path for validation issues
   * @param meshVariants - The root-level MAXAR_mesh_variants extension object
   * @param context - The `ValidationContext` that any issues will be added to
   * @returns Whether the object was valid
   */
  private static validateRootMeshVariants(
    path: string,
    meshVariants: any,
    context: ValidationContext
  ): boolean {
    // Make sure that the given value is an object
    if (
      !BasicValidator.validateObject(
        path,
        "MAXAR_mesh_variants",
        meshVariants,
        context
      )
    ) {
      return false;
    }

    let result = true;

    // Validate the variants array (required)
    const variants = meshVariants.variants;
    const variantsPath = path + "/variants";
    if (
      !BasicValidator.validateArray(
        variantsPath,
        "variants",
        variants,
        1, // minItems: 1
        256, // maxItems: 256
        "object",
        context
      )
    ) {
      result = false;
    } else {
      // Validate each variant object
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const variantPath = variantsPath + "/" + i;
        if (
          !MaxarMeshVariantsValidator.validateVariant(
            variantPath,
            variant,
            context
          )
        ) {
          result = false;
        }
      }
    }

    // Validate the default property (required)
    const defaultVariant = meshVariants.default;
    const defaultPath = path + "/default";
    if (
      !BasicValidator.validateInteger(
        defaultPath,
        "default",
        defaultVariant,
        context
      )
    ) {
      result = false;
    } else {
      // Validate that default index is within bounds
      if (defined(variants) && Array.isArray(variants)) {
        if (
          !BasicValidator.validateIntegerRange(
            defaultPath,
            "default",
            defaultVariant,
            0,
            true,
            variants.length,
            false,
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
   * Validate a single variant object
   *
   * @param path - The path for validation issues
   * @param variant - The variant object to validate
   * @param context - The `ValidationContext` that any issues will be added to
   * @returns Whether the object was valid
   */
  private static validateVariant(
    path: string,
    variant: any,
    context: ValidationContext
  ): boolean {
    // Make sure that the given value is an object
    if (!BasicValidator.validateObject(path, "variant", variant, context)) {
      return false;
    }

    let result = true;

    // Validate the name property (required)
    const name = variant.name;
    const namePath = path + "/name";
    if (
      !BasicValidator.validateStringLength(
        namePath,
        "name",
        name,
        1, // minLength: 1
        256, // maxLength: 256
        context
      )
    ) {
      result = false;
    }

    return result;
  }

  /**
   * Validate a node-level MAXAR_mesh_variants extension object
   *
   * @param path - The path for validation issues
   * @param nodeMeshVariants - The node-level MAXAR_mesh_variants extension object
   * @param rootMeshVariants - The root-level MAXAR_mesh_variants extension object
   * @param gltf - The complete glTF object for reference validation
   * @param context - The `ValidationContext` that any issues will be added to
   * @returns Whether the object was valid
   */
  private static validateNodeMeshVariants(
    path: string,
    nodeMeshVariants: any,
    rootMeshVariants: any,
    gltf: any,
    context: ValidationContext
  ): boolean {
    // Make sure that the given value is an object
    if (
      !BasicValidator.validateObject(
        path,
        "MAXAR_mesh_variants",
        nodeMeshVariants,
        context
      )
    ) {
      return false;
    }

    let result = true;

    // Validate the mappings array (required)
    const mappings = nodeMeshVariants.mappings;
    const mappingsPath = path + "/mappings";
    if (
      !BasicValidator.validateArray(
        mappingsPath,
        "mappings",
        mappings,
        1, // minItems: 1
        256, // maxItems: 256
        "object",
        context
      )
    ) {
      result = false;
    } else {
      // Track used variant indices to ensure uniqueness across all mappings
      const usedVariantIndices = new Set<number>();

      // Validate each mapping object
      for (let i = 0; i < mappings.length; i++) {
        const mapping = mappings[i];
        const mappingPath = mappingsPath + "/" + i;
        const mappingValid = MaxarMeshVariantsValidator.validateMapping(
          mappingPath,
          mapping,
          rootMeshVariants,
          gltf,
          usedVariantIndices,
          context
        );
        if (!mappingValid) {
          result = false;
        }
      }
    }

    return result;
  }

  /**
   * Validate a single mapping object
   *
   * @param path - The path for validation issues
   * @param mapping - The mapping object to validate
   * @param rootMeshVariants - The root-level MAXAR_mesh_variants extension object
   * @param gltf - The complete glTF object for reference validation
   * @param usedVariantIndices - Set to track used variant indices for uniqueness
   * @param context - The `ValidationContext` that any issues will be added to
   * @returns Whether the object was valid
   */
  private static validateMapping(
    path: string,
    mapping: any,
    rootMeshVariants: any,
    gltf: any,
    usedVariantIndices: Set<number>,
    context: ValidationContext
  ): boolean {
    // Make sure that the given value is an object
    if (!BasicValidator.validateObject(path, "mapping", mapping, context)) {
      return false;
    }

    let result = true;

    // Validate the mesh property (required)
    const mesh = mapping.mesh;
    const meshPath = path + "/mesh";
    if (!BasicValidator.validateInteger(meshPath, "mesh", mesh, context)) {
      result = false;
    } else {
      // Validate that mesh index is within bounds
      const meshes = gltf.meshes;
      if (defined(meshes) && Array.isArray(meshes)) {
        if (
          !BasicValidator.validateIntegerRange(
            meshPath,
            "mesh",
            mesh,
            0,
            true,
            meshes.length,
            false,
            context
          )
        ) {
          result = false;
        }
      }
    }

    // Validate the variants array (required)
    const variants = mapping.variants;
    const variantsPath = path + "/variants";
    if (
      !BasicValidator.validateIndexArray(
        variantsPath,
        "variants",
        variants,
        defined(rootMeshVariants?.variants)
          ? rootMeshVariants.variants.length
          : undefined,
        context
      )
    ) {
      result = false;
    } else {
      // Check for uniqueness within this mapping (handled by schema uniqueItems: true)
      // and across all mappings in the node
      for (const variantIndex of variants) {
        if (usedVariantIndices.has(variantIndex)) {
          const message = `Variant index ${variantIndex} is used in multiple mappings. Each variant may only be used once across all mappings.`;
          const issue = JsonValidationIssues.VALUE_NOT_IN_LIST(
            variantsPath,
            message
          );
          context.addIssue(issue);
          result = false;
        } else {
          usedVariantIndices.add(variantIndex);
        }
      }
    }

    // Validate the optional name property
    const name = mapping.name;
    if (defined(name)) {
      const namePath = path + "/name";
      if (
        !BasicValidator.validateStringLength(
          namePath,
          "name",
          name,
          1, // minLength: 1
          256, // maxLength: 256
          context
        )
      ) {
        result = false;
      }
    }

    return result;
  }
}
