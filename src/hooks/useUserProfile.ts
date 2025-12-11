import { useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  bodyType: "ectomorph" | "mesomorph" | "endomorph";
  goalWeight: number;
}

const defaultProfile: UserProfile = {
  name: "",
  age: 30,
  weight: 70,
  height: 170,
  gender: "male",
  activityLevel: "moderate",
  bodyType: "mesomorph",
  goalWeight: 65,
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("userProfile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem("userProfile", JSON.stringify(newProfile));
  };

  const calculateBMI = (): number => {
    const heightInMeters = profile.height / 100;
    return profile.weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "normal";
    if (bmi < 30) return "overweight";
    if (bmi < 35) return "obese1";
    if (bmi < 40) return "obese2";
    return "obese3";
  };

  const getIdealWeight = (): { min: number; max: number } => {
    const heightInMeters = profile.height / 100;
    return {
      min: Math.round(18.5 * heightInMeters * heightInMeters),
      max: Math.round(24.9 * heightInMeters * heightInMeters),
    };
  };

  const calculateTDEE = (): number => {
    // Harris-Benedict equation
    let bmr: number;
    if (profile.gender === "male") {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    return Math.round(bmr * activityMultipliers[profile.activityLevel]);
  };

  const getDietRecommendation = () => {
    const bmi = calculateBMI();
    const tdee = calculateTDEE();
    const category = getBMICategory(bmi);
    
    let calorieDeficit = 0;
    let proteinMultiplier = 1.6; // g per kg
    let carbPercentage = 0.45;
    let fatPercentage = 0.25;

    // Adjust based on BMI category
    if (category === "underweight") {
      calorieDeficit = -300; // surplus
      proteinMultiplier = 1.8;
    } else if (category === "normal") {
      calorieDeficit = 0;
      proteinMultiplier = 1.6;
    } else if (category === "overweight") {
      calorieDeficit = 500;
      proteinMultiplier = 2.0;
      carbPercentage = 0.40;
      fatPercentage = 0.30;
    } else {
      calorieDeficit = 700;
      proteinMultiplier = 2.2;
      carbPercentage = 0.35;
      fatPercentage = 0.30;
    }

    // Adjust based on body type
    if (profile.bodyType === "ectomorph") {
      carbPercentage += 0.05;
      fatPercentage -= 0.05;
    } else if (profile.bodyType === "endomorph") {
      carbPercentage -= 0.10;
      fatPercentage += 0.05;
      proteinMultiplier += 0.2;
    }

    const targetCalories = tdee - calorieDeficit;
    const protein = Math.round(profile.weight * proteinMultiplier);
    const proteinCalories = protein * 4;
    const remainingCalories = targetCalories - proteinCalories;
    const carbs = Math.round((remainingCalories * carbPercentage) / 4);
    const fat = Math.round((remainingCalories * fatPercentage) / 9);

    return {
      calories: Math.round(targetCalories),
      protein,
      carbs,
      fat,
      tdee,
      deficit: calorieDeficit,
    };
  };

  return {
    profile,
    saveProfile,
    calculateBMI,
    getBMICategory,
    getIdealWeight,
    calculateTDEE,
    getDietRecommendation,
  };
}
