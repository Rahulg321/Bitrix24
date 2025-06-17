---Add Ebitda margin where needed data exists
UPDATE "Deal"
    SET "ebitdaMargin" = ("ebitda"/"revenue")
    WHERE NOT "revenue" = 0 AND NOT "ebitda" = 0;

---Set Ebitda Margin to -1 when necessary data does not exist
UPDATE "Deal"
    SET "ebitdaMargin" = -1
    WHERE "revenue" = 0 OR "ebitda" = 0;
