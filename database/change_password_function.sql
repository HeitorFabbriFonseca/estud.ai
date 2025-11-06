-- Função para alterar senha do usuário
-- Verifica a senha atual antes de permitir a alteração
CREATE OR REPLACE FUNCTION change_password(
  p_user_id UUID,
  p_current_password TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user RECORD;
  v_new_password_hash TEXT;
BEGIN
  -- Buscar usuário pelo ID
  SELECT * INTO v_user
  FROM user_info
  WHERE id = p_user_id;

  -- Se não encontrar usuário, retornar false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Verificar se a senha atual está correta
  IF crypt(p_current_password, v_user.password_hash) != v_user.password_hash THEN
    RETURN FALSE;
  END IF;

  -- Gerar hash da nova senha
  v_new_password_hash := crypt(p_new_password, gen_salt('bf'));

  -- Atualizar a senha
  UPDATE user_info
  SET password_hash = v_new_password_hash,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Retornar true se a atualização foi bem-sucedida
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

