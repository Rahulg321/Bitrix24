import { z } from "zod";

const RuleConditionSchema = z.object({
  fact: z.string(),
  operator: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.any())]),
});

const RuleSchema = z.object({
  conditions: z.object({
    all: z.array(RuleConditionSchema),
  }),
  event: z.object({
    type: z.string(),
    params: z.record(z.string(), z.any()),
  }),
});

const RulesEngineObjectSchema = z.object({
  rules: z.array(RuleSchema),
});

export { RulesEngineObjectSchema };
