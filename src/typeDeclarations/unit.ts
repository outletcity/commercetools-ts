import {AttributeType} from "@commercetools/platform-sdk/dist/declarations/src/generated/models/product-type";

export const UNIT: AttributeType = {
    name: "enum",
    values: [
        {key: "percent", label: "%"},
        {key: "gram", label: "g"},
        {key: "kilogram", label: "kg"},
        {key: "liter", label: "l"},
        {key: "milliliter", label: "ml"}
    ]
}
