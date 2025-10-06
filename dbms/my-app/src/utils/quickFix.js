import { supabase } from '../services/supabase';

// Quick fix for current user - run this in browser console
export const fixCurrentUserCitizenRecord = async () => {
  try {
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('No authenticated user found');
      return;
    }

    console.log('Current user ID:', user.id);

    // Check if citizen record exists
    const { data: existingCitizen, error: checkError } = await supabase
      .from('citizens')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking citizen record:', checkError);
      return;
    }

    if (existingCitizen) {
      console.log('Citizen record already exists:', existingCitizen);
      return existingCitizen;
    }

    // Create citizen record
    console.log('Creating citizen record...');
    const { data: newCitizen, error: insertError } = await supabase
      .from('citizens')
      .insert([
        {
          user_id: user.id,
          address: 'Please update your address',
          city: 'Please update your city',
          pincode: '000000'
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating citizen record:', insertError);
      throw insertError;
    }

    console.log('Citizen record created successfully:', newCitizen);
    return newCitizen;
  } catch (error) {
    console.error('Error in fixCurrentUserCitizenRecord:', error);
    throw error;
  }
};

// Make it available globally for console access
if (typeof window !== 'undefined') {
  window.fixCurrentUserCitizenRecord = fixCurrentUserCitizenRecord;
}
