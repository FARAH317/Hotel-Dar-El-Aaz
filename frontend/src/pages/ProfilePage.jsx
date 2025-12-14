import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, changePassword, selectUser, selectAuthLoading } from '@/features/auth/store/authSlice';
import { validateForm } from '@/utils/validators';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [errors, setErrors] = useState({});

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(profileData, {
      first_name: { required: true, minLength: 2 },
      last_name: { required: true, minLength: 2 },
      phone: { phone: true },
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await dispatch(updateProfile(profileData));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(passwordData, {
      old_password: { required: true },
      new_password: { required: true, password: true },
      new_password_confirm: {
        required: true,
        validator: (value, values) => {
          if (value !== values.new_password) {
            return 'Les mots de passe ne correspondent pas';
          }
          return null;
        },
      },
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await dispatch(changePassword({
      oldPassword: passwordData.old_password,
      newPassword: passwordData.new_password,
    }));

    if (changePassword.fulfilled.match(result)) {
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        <Card title="Informations personnelles">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="Prénom"
              name="first_name"
              value={profileData.first_name}
              onChange={(e) => handleProfileChange('first_name', e.target.value)}
              error={errors.first_name}
              required
            />

            <Input
              label="Nom"
              name="last_name"
              value={profileData.last_name}
              onChange={(e) => handleProfileChange('last_name', e.target.value)}
              error={errors.last_name}
              required
            />

            <Input
              label="Email"
              type="email"
              value={user?.email}
              disabled
            />

            <Input
              label="Téléphone"
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              error={errors.phone}
            />

            <Button type="submit" fullWidth loading={isLoading}>
              Mettre à jour le profil
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card title="Changer le mot de passe">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Mot de passe actuel"
              type="password"
              name="old_password"
              value={passwordData.old_password}
              onChange={(e) => handlePasswordChange('old_password', e.target.value)}
              error={errors.old_password}
              required
            />

            <Input
              label="Nouveau mot de passe"
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={(e) => handlePasswordChange('new_password', e.target.value)}
              error={errors.new_password}
              required
            />

            <Input
              label="Confirmer le nouveau mot de passe"
              type="password"
              name="new_password_confirm"
              value={passwordData.new_password_confirm}
              onChange={(e) => handlePasswordChange('new_password_confirm', e.target.value)}
              error={errors.new_password_confirm}
              required
            />

            <Button type="submit" fullWidth loading={isLoading}>
              Changer le mot de passe
            </Button>
          </form>
        </Card>
      </div>

      {/* Account Info */}
      <Card title="Informations du compte" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Rôle</p>
            <p className="font-semibold">{user?.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Compte créé le</p>
            <p className="font-semibold">
              {new Date(user?.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;