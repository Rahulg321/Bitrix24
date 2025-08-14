"use server";

import {
  addPocFormSchema,
  AddPocFormValues,
} from "@/components/forms/add-poc-form";
import prismaDB from "@/lib/prisma.server";
import { User } from "@prisma/client";
import { withAuthServerAction } from "@/lib/withAuth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AddPoc = withAuthServerAction(
  async (user: User, values: AddPocFormValues, dealId: string) => {
    // const validationResult = addPocFormSchema.safeParse(values);

    // if (!validationResult.success) {
    //   console.log(validationResult.error.flatten().fieldErrors);
    //   return {
    //     type: "error",
    //     message: "Invalid input. Please check the form fields.",
    //   };
    // }

    // const validatedFields = validationResult.data;

    try {
      const newPoc = await prismaDB.pOC.create({
        data: {
          name: values.name,
          email: values.email,
          workPhone: values.workPhone,
          dealId,
        },
      });

      revalidatePath(`/raw-deals/${dealId}`);
      revalidatePath(`/manual-deals/${dealId}`); // Assuming this path might also need revalidation

      return {
        type: "success",
        message: "POC added successfully.",
        poc: newPoc, // Optionally return the created POC
      };
    } catch (error) {
      console.error("Error adding POC:", error);
      // Check for specific Prisma errors if needed
      return {
        type: "error",
        message: "Failed to add POC. Please try again.",
      };
    }
  },
);

export default AddPoc;
