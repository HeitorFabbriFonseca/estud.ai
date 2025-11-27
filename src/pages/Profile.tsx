import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserService } from '../services/userService';
import { Avatar } from '../components/Avatar';
import { User, Settings, LogOut, Edit3, Save, X, Lock, Eye, EyeOff, Camera } from 'lucide-react';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Estados para alterar senha
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPasswordLoading, setIsChangingPasswordLoading] = useState(false);

  // Atualizar campos quando user mudar
  useEffect(() => {
    if (user) {
      setEditedName(user.name || '');
      setEditedEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !updateUser) return;

    // Validações
    if (!editedName.trim()) {
      showToast('O nome não pode estar vazio', 'error');
      return;
    }

    if (!editedEmail.trim()) {
      showToast('O email não pode estar vazio', 'error');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedEmail)) {
      showToast('Email inválido', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const success = await UserService.updateUser(user.id, {
        name: editedName.trim(),
        email: editedEmail.trim(),
      });

      if (success) {
        showToast('Informações atualizadas com sucesso!', 'success');
        setIsEditing(false);
        // Atualizar o contexto de autenticação
        const updatedUser = await UserService.getUserById(user.id);
        if (updatedUser && updateUser) {
          const userData = {
            id: updatedUser.id,
            username: updatedUser.username,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar || undefined,
          };
          updateUser(userData);
        }
      } else {
        showToast('Erro ao atualizar informações', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showToast('Erro ao salvar informações', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setEditedEmail(user?.email || '');
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !updateUser) return;

    setIsUploadingAvatar(true);

    try {
      const result = await UserService.uploadAvatar(user.id, file);

      if (result.success && result.url) {
        showToast('Avatar atualizado com sucesso!', 'success');
        const updatedUserData = {
          ...user,
          avatar: result.url,
        };
        updateUser(updatedUserData);
      } else {
        showToast(result.error || 'Erro ao fazer upload do avatar', 'error');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      showToast('Erro ao fazer upload do avatar', 'error');
    } finally {
      setIsUploadingAvatar(false);
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    setPasswordError('');
    setPasswordSuccess('');

    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('A nova senha deve ser diferente da senha atual');
      return;
    }

    setIsChangingPasswordLoading(true);

    try {
      const result = await UserService.changePassword(
        user.id,
        currentPassword,
        newPassword
      );

      if (result.success) {
        showToast('Senha alterada com sucesso!', 'success');
        setPasswordSuccess('Senha alterada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setIsChangingPassword(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(result.error || 'Erro ao alterar senha');
        showToast(result.error || 'Erro ao alterar senha', 'error');
      }
    } catch (error) {
      setPasswordError('Erro ao alterar senha');
    } finally {
      setIsChangingPasswordLoading(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  if (!user) return null;

  return (
    <div className="flex h-full w-full flex-col rounded-[36px] border border-white/10 bg-slate-950/70 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-cyan-400/40 hover:text-white"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <span className="mr-2 animate-spin">⏳</span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center space-x-6">
            <div className="relative group">
              <div className="relative">
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  size="lg"
                  showStatus={true}
                />
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                  title="Clique para alterar o avatar"
                >
                  {isUploadingAvatar ? (
                    <span className="text-white animate-spin text-2xl">⏳</span>
                  ) : (
                    <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user.name}</h2>
              <p className="text-white/60">@{user.username}</p>
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="mt-2 text-sm text-cyan-200 hover:text-white disabled:opacity-50"
              >
                {isUploadingAvatar ? 'Enviando...' : 'Alterar avatar'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 flex items-center text-lg font-medium text-white">
                <User className="mr-2 h-5 w-5 text-cyan-200" />
                Informações Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Nome Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/40 px-3 py-2 text-white focus:border-cyan-400/60 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{user.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/40 px-3 py-2 text-white focus:border-cyan-400/60 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{user.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Nome de Usuário
                  </label>
                  <p className="text-white">@{user.username}</p>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    ID do Usuário
                  </label>
                  <p className="font-mono text-sm text-white/80">{user.id}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 flex items-center text-lg font-medium text-white">
                <Settings className="mr-2 h-5 w-5 text-cyan-200" />
                Configurações da Conta
              </h3>
              
              <div className="space-y-4">
                {/* Seção de Alterar Senha */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <Lock className="mr-2 h-5 w-5 text-white/70" />
                      <div>
                        <h4 className="font-medium text-white">Alterar Senha</h4>
                        <p className="text-sm text-white/60">Atualize sua senha de acesso</p>
                      </div>
                    </div>
                    {!isChangingPassword && (
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-cyan-400/40 hover:text-white"
                      >
                        Alterar
                      </button>
                    )}
                  </div>

                  {isChangingPassword && (
                    <div className="mt-4 space-y-4">
                      {passwordError && (
                        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                          {passwordError}
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                          {passwordSuccess}
                        </div>
                      )}

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/70">
                          Senha Atual
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-slate-900/40 px-3 py-2 pr-10 text-white focus:border-cyan-400/60 focus:outline-none"
                            placeholder="Digite sua senha atual"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/70">
                          Nova Senha
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-slate-900/40 px-3 py-2 pr-10 text-white focus:border-cyan-400/60 focus:outline-none"
                            placeholder="Digite sua nova senha"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/70">
                          Confirmar Nova Senha
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-slate-900/40 px-3 py-2 pr-10 text-white focus:border-cyan-400/60 focus:outline-none"
                            placeholder="Confirme sua nova senha"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <button
                          onClick={handleChangePassword}
                          disabled={isChangingPasswordLoading}
                          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isChangingPasswordLoading ? (
                            <>
                              <span className="mr-2 animate-spin">⏳</span>
                              Alterando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Salvar
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelPasswordChange}
                          disabled={isChangingPasswordLoading}
                          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6">
              <h3 className="mb-4 flex items-center text-lg font-medium text-white">
                <LogOut className="mr-2 h-5 w-5" />
                Zona de Perigo
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-white/80">
                  Ações nesta seção são irreversíveis. Tenha cuidado.
                </p>
                
                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:from-rose-400 hover:to-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
