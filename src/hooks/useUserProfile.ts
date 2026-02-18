import { useState, useEffect, useCallback } from "react";

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  bodyType: "ectomorph" | "mesomorph" | "endomorph";
  goalWeight: number;
  foodPreferences: string[];
  medicalLimitations: string[];
  dailyRoutine: "regular" | "shift" | "nocturnal" | "irregular";
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
  foodPreferences: [],
  medicalLimitations: [],
  dailyRoutine: "regular",
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultProfile, ...parsed };
    }
    return defaultProfile;
  });

  // Cross-component sync: listen for storage events from other instances
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "userProfile" && e.newValue) {
        try {
          setProfile(prev => ({ ...defaultProfile, ...JSON.parse(e.newValue!) }));
        } catch { /* ignore */ }
      }
    };
    // Also listen for custom events (same-tab broadcast)
    const customHandler = () => {
      const saved = localStorage.getItem("userProfile");
      if (saved) {
        try {
          setProfile(prev => ({ ...defaultProfile, ...JSON.parse(saved) }));
        } catch { /* ignore */ }
      }
    };
    window.addEventListener("storage", handler);
    window.addEventListener("userProfileUpdated", customHandler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("userProfileUpdated", customHandler);
    };
  }, []);

  const saveProfile = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem("userProfile", JSON.stringify(newProfile));
    // Broadcast to other components in the same tab
    window.dispatchEvent(new Event("userProfileUpdated"));
  }, []);

  const calculateBMI = (): number => {
    if (!profile.height || !profile.weight) return 0;
    const heightInMeters = profile.height / 100;
    return profile.weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 16) return "severeThinness";
    if (bmi < 17) return "moderateThinness";
    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "normal";
    if (bmi < 30) return "overweight";
    if (bmi < 35) return "obese1";
    if (bmi < 40) return "obese2";
    return "obese3";
  };

  const getIdealWeight = (): { min: number; max: number; optimal: number } => {
    const heightInMeters = profile.height / 100;
    const heightSquared = heightInMeters * heightInMeters;
    
    let minBMI = 18.5;
    let maxBMI = 24.9;
    
    if (profile.age >= 65) {
      minBMI = 22;
      maxBMI = 27;
    } else if (profile.age >= 50) {
      minBMI = 20;
      maxBMI = 25;
    }
    
    const optimalBMI = profile.age >= 65 ? 24 : (profile.age >= 50 ? 23 : 22);
    
    return {
      min: Math.round(minBMI * heightSquared * 10) / 10,
      max: Math.round(maxBMI * heightSquared * 10) / 10,
      optimal: Math.round(optimalBMI * heightSquared * 10) / 10,
    };
  };

  const calculateBMR = (): number => {
    if (!profile.weight || !profile.height || !profile.age) return 0;
    
    let bmr: number;
    if (profile.gender === "male") {
      bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5;
    } else {
      bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) - 161;
    }
    
    return Math.round(bmr);
  };

  const calculateTDEE = (): number => {
    const bmr = calculateBMR();
    if (!bmr) return 0;

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    return Math.round(bmr * activityMultipliers[profile.activityLevel]);
  };

  const estimateBodyFat = (): number => {
    const bmi = calculateBMI();
    if (!bmi || !profile.age) return 0;
    
    const genderFactor = profile.gender === "male" ? 1 : 0;
    const bodyFat = (1.2 * bmi) + (0.23 * profile.age) - (10.8 * genderFactor) - 5.4;
    
    return Math.max(0, Math.round(bodyFat * 10) / 10);
  };

  const calculateWaterIntake = (): number => {
    const baseIntake = profile.weight * 35;
    
    const activityAdjustment = {
      sedentary: 0,
      light: 250,
      moderate: 500,
      active: 750,
      veryActive: 1000,
    };
    
    return Math.round((baseIntake + activityAdjustment[profile.activityLevel]) / 100) * 100;
  };

  const getDietRecommendation = () => {
    const bmi = calculateBMI();
    const tdee = calculateTDEE();
    const bmr = calculateBMR();
    const category = getBMICategory(bmi);
    const bodyFat = estimateBodyFat();
    const waterIntake = calculateWaterIntake();
    
    let calorieAdjustment = 0;
    let proteinMultiplier = 1.6;
    let carbPercentage = 0.50;
    let fatPercentage = 0.50;
    
    switch(category) {
      case "severeThinness":
      case "moderateThinness":
        calorieAdjustment = -500;
        proteinMultiplier = 2.0;
        carbPercentage = 0.55;
        fatPercentage = 0.45;
        break;
      case "underweight":
        calorieAdjustment = -300;
        proteinMultiplier = 1.8;
        carbPercentage = 0.55;
        fatPercentage = 0.45;
        break;
      case "normal":
        calorieAdjustment = 0;
        proteinMultiplier = 1.6;
        carbPercentage = 0.50;
        fatPercentage = 0.50;
        break;
      case "overweight":
        calorieAdjustment = 500;
        proteinMultiplier = 2.0;
        carbPercentage = 0.40;
        fatPercentage = 0.60;
        break;
      case "obese1":
        calorieAdjustment = 600;
        proteinMultiplier = 2.2;
        carbPercentage = 0.35;
        fatPercentage = 0.65;
        break;
      case "obese2":
      case "obese3":
        calorieAdjustment = 750;
        proteinMultiplier = 2.4;
        carbPercentage = 0.30;
        fatPercentage = 0.70;
        break;
    }

    switch(profile.bodyType) {
      case "ectomorph":
        carbPercentage += 0.10;
        fatPercentage -= 0.10;
        if (calorieAdjustment > 0) calorieAdjustment -= 100;
        break;
      case "endomorph":
        carbPercentage -= 0.10;
        fatPercentage += 0.05;
        proteinMultiplier += 0.2;
        if (calorieAdjustment < 500 && category !== "underweight") {
          calorieAdjustment += 100;
        }
        break;
    }

    if (profile.age >= 50) {
      proteinMultiplier += 0.2;
    }
    if (profile.age >= 65) {
      proteinMultiplier += 0.2;
      if (calorieAdjustment > 500) calorieAdjustment = 500;
    }

    const targetCalories = Math.max(
      profile.gender === "male" ? 1500 : 1200,
      tdee - calorieAdjustment
    );

    const protein = Math.round(profile.weight * proteinMultiplier);
    const proteinCalories = protein * 4;

    const remainingCalories = targetCalories - proteinCalories;
    
    const carbCalories = remainingCalories * carbPercentage;
    const fatCalories = remainingCalories * fatPercentage;
    
    const carbs = Math.round(carbCalories / 4);
    const fat = Math.round(fatCalories / 9);

    const fiber = Math.round((targetCalories / 1000) * 14);

    let weeksToGoal = 0;
    const weightDifference = profile.weight - profile.goalWeight;
    if (weightDifference > 0 && calorieAdjustment > 0) {
      const weeklyLoss = (calorieAdjustment * 7) / 7700;
      weeksToGoal = Math.ceil(weightDifference / weeklyLoss);
    } else if (weightDifference < 0 && calorieAdjustment < 0) {
      const weeklyGain = (Math.abs(calorieAdjustment) * 7) / 7700;
      weeksToGoal = Math.ceil(Math.abs(weightDifference) / weeklyGain);
    }

    return {
      calories: Math.round(targetCalories),
      protein,
      carbs,
      fat,
      fiber,
      tdee,
      bmr,
      deficit: calorieAdjustment,
      bodyFat,
      waterIntake,
      weeksToGoal,
      macroRatio: {
        protein: Math.round((proteinCalories / targetCalories) * 100),
        carbs: Math.round((carbCalories / targetCalories) * 100),
        fat: Math.round((fatCalories / targetCalories) * 100),
      }
    };
  };

  return {
    profile,
    saveProfile,
    calculateBMI,
    getBMICategory,
    getIdealWeight,
    calculateBMR,
    calculateTDEE,
    estimateBodyFat,
    calculateWaterIntake,
    getDietRecommendation,
  };
}
