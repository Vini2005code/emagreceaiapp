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

  /**
   * Calcula o IMC (Índice de Massa Corporal)
   * Fórmula: peso (kg) / altura² (m)
   */
  const calculateBMI = (): number => {
    if (!profile.height || !profile.weight) return 0;
    const heightInMeters = profile.height / 100;
    return profile.weight / (heightInMeters * heightInMeters);
  };

  /**
   * Categoriza o IMC segundo a OMS (Organização Mundial da Saúde)
   * Com classificações detalhadas para obesidade
   */
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

  /**
   * Calcula a faixa de peso ideal baseado no IMC saudável (18.5 - 24.9)
   * Ajustado por idade conforme recomendações geriátricas
   */
  const getIdealWeight = (): { min: number; max: number; optimal: number } => {
    const heightInMeters = profile.height / 100;
    const heightSquared = heightInMeters * heightInMeters;
    
    // Ajuste para idade - pessoas mais velhas podem ter IMC ligeiramente maior
    let minBMI = 18.5;
    let maxBMI = 24.9;
    
    if (profile.age >= 65) {
      minBMI = 22;
      maxBMI = 27;
    } else if (profile.age >= 50) {
      minBMI = 20;
      maxBMI = 25;
    }
    
    // IMC ótimo considerado: 22 para maioria, ajustado por idade
    const optimalBMI = profile.age >= 65 ? 24 : (profile.age >= 50 ? 23 : 22);
    
    return {
      min: Math.round(minBMI * heightSquared * 10) / 10,
      max: Math.round(maxBMI * heightSquared * 10) / 10,
      optimal: Math.round(optimalBMI * heightSquared * 10) / 10,
    };
  };

  /**
   * Calcula a Taxa Metabólica Basal (TMB) usando a fórmula Mifflin-St Jeor
   * Esta é considerada a fórmula mais precisa atualmente (2005)
   * 
   * Homens: TMB = (10 × peso em kg) + (6.25 × altura em cm) − (5 × idade) + 5
   * Mulheres: TMB = (10 × peso em kg) + (6.25 × altura em cm) − (5 × idade) − 161
   */
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

  /**
   * Calcula o Gasto Energético Total Diário (TDEE)
   * TDEE = TMB × Fator de Atividade
   * 
   * Multiplicadores de atividade baseados em estudos científicos:
   * - Sedentário: pouco ou nenhum exercício (1.2)
   * - Leve: exercício leve 1-3 dias/semana (1.375)
   * - Moderado: exercício moderado 3-5 dias/semana (1.55)
   * - Ativo: exercício intenso 6-7 dias/semana (1.725)
   * - Muito Ativo: atleta ou trabalho físico pesado (1.9)
   */
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

  /**
   * Calcula a porcentagem de gordura corporal estimada
   * Usando a fórmula do método do IMC (estimativa)
   * Fórmula: (1.2 × IMC) + (0.23 × idade) - (10.8 × sexo) - 5.4
   * sexo: 1 para homem, 0 para mulher
   */
  const estimateBodyFat = (): number => {
    const bmi = calculateBMI();
    if (!bmi || !profile.age) return 0;
    
    const genderFactor = profile.gender === "male" ? 1 : 0;
    const bodyFat = (1.2 * bmi) + (0.23 * profile.age) - (10.8 * genderFactor) - 5.4;
    
    return Math.max(0, Math.round(bodyFat * 10) / 10);
  };

  /**
   * Calcula a quantidade de água recomendada por dia
   * Base: 35ml por kg de peso corporal
   * Ajustado por nível de atividade
   */
  const calculateWaterIntake = (): number => {
    const baseIntake = profile.weight * 35; // ml
    
    const activityAdjustment = {
      sedentary: 0,
      light: 250,
      moderate: 500,
      active: 750,
      veryActive: 1000,
    };
    
    return Math.round((baseIntake + activityAdjustment[profile.activityLevel]) / 100) * 100;
  };

  /**
   * Calcula recomendações de dieta personalizadas
   * Baseado em: IMC, idade, sexo, nível de atividade e biotipo
   */
  const getDietRecommendation = () => {
    const bmi = calculateBMI();
    const tdee = calculateTDEE();
    const bmr = calculateBMR();
    const category = getBMICategory(bmi);
    const bodyFat = estimateBodyFat();
    const waterIntake = calculateWaterIntake();
    
    // Déficit/superávit calórico seguro (não exceder 1000 kcal)
    let calorieAdjustment = 0;
    
    // Proteína: 1.6-2.2g por kg de peso corporal
    let proteinMultiplier = 1.6;
    
    // Distribuição de macros (restante após proteína)
    let carbPercentage = 0.50; // 50% das calorias restantes
    let fatPercentage = 0.50;  // 50% das calorias restantes
    
    // Ajustes baseados na categoria de IMC
    switch(category) {
      case "severeThinness":
      case "moderateThinness":
        calorieAdjustment = -500; // Superávit de 500 kcal
        proteinMultiplier = 2.0;
        carbPercentage = 0.55;
        fatPercentage = 0.45;
        break;
      case "underweight":
        calorieAdjustment = -300; // Superávit de 300 kcal
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
        calorieAdjustment = 500; // Déficit de 500 kcal (~0.5kg/semana)
        proteinMultiplier = 2.0;
        carbPercentage = 0.40;
        fatPercentage = 0.60;
        break;
      case "obese1":
        calorieAdjustment = 600; // Déficit de 600 kcal
        proteinMultiplier = 2.2;
        carbPercentage = 0.35;
        fatPercentage = 0.65;
        break;
      case "obese2":
      case "obese3":
        calorieAdjustment = 750; // Déficit de 750 kcal
        proteinMultiplier = 2.4;
        carbPercentage = 0.30;
        fatPercentage = 0.70;
        break;
    }

    // Ajustes baseados no biotipo
    switch(profile.bodyType) {
      case "ectomorph":
        // Metabolismo rápido - precisa de mais carboidratos
        carbPercentage += 0.10;
        fatPercentage -= 0.10;
        if (calorieAdjustment > 0) calorieAdjustment -= 100; // Menos déficit
        break;
      case "endomorph":
        // Metabolismo lento - menos carboidratos, mais proteína
        carbPercentage -= 0.10;
        fatPercentage += 0.05;
        proteinMultiplier += 0.2;
        if (calorieAdjustment < 500 && category !== "underweight") {
          calorieAdjustment += 100; // Mais déficit
        }
        break;
      // mesomorph - sem ajustes adicionais
    }

    // Ajuste para idade - pessoas mais velhas precisam de mais proteína
    if (profile.age >= 50) {
      proteinMultiplier += 0.2;
    }
    if (profile.age >= 65) {
      proteinMultiplier += 0.2;
      // Menos déficit para idosos para preservar massa muscular
      if (calorieAdjustment > 500) calorieAdjustment = 500;
    }

    // Cálculo final das calorias alvo
    const targetCalories = Math.max(
      profile.gender === "male" ? 1500 : 1200, // Mínimo seguro
      tdee - calorieAdjustment
    );

    // Cálculo dos macronutrientes
    // Proteína: baseada no peso corporal
    const protein = Math.round(profile.weight * proteinMultiplier);
    const proteinCalories = protein * 4;

    // Calorias restantes para carboidratos e gorduras
    const remainingCalories = targetCalories - proteinCalories;
    
    // Distribuição das calorias restantes
    const carbCalories = remainingCalories * carbPercentage;
    const fatCalories = remainingCalories * fatPercentage;
    
    const carbs = Math.round(carbCalories / 4); // 4 kcal por grama de carb
    const fat = Math.round(fatCalories / 9);   // 9 kcal por grama de gordura

    // Cálculo de fibras recomendadas (14g por 1000 kcal)
    const fiber = Math.round((targetCalories / 1000) * 14);

    // Tempo estimado para atingir meta (se houver déficit)
    let weeksToGoal = 0;
    const weightDifference = profile.weight - profile.goalWeight;
    if (weightDifference > 0 && calorieAdjustment > 0) {
      // 1kg de gordura = ~7700 kcal
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
