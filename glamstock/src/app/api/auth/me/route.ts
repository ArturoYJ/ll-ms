import { NextResponse } from 'next/server';
import { withAuth } from '@/modules/auth/middleware/jwt.middleware';
import { UsuariosRepository } from '@/modules/auth/repositories/usuarios.repository';

export const GET = withAuth(async (_req, payload) => {
  const usuario = await UsuariosRepository.findById(payload.userId);

  if (!usuario) {
    return NextResponse.json(
      { error: 'Usuario no encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json({ usuario }, { status: 200 });
});
