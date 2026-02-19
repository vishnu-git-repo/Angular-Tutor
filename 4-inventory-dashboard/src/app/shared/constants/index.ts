import { EquipmentCategory } from "../Enums/EquipmentEnums";

// UserConstant
export const GenderConstant = ["Male", "Female", "Other"];
export const PagesConstant = [5,10,25,50];



// EquipmentConstant
// export const CategoryConstant = ["Tools","Electronics","Vehicles","Furniture","Safety Gear","Other"];
export const CategoryConstant = Object.keys(EquipmentCategory)
  .filter(k => isNaN(Number(k))) as (keyof typeof EquipmentCategory)[];
