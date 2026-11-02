# Scale Garage 64

Site de miniaturas 1:64 (vitrine à venda + coleção) com painel admin.

- **Site:** `/` — topo animado com scroll, contador de miniaturas, à venda (busca + filtro), importação com grade de marcas, estante digital, coleção (busca + filtro) e "Explore uma miniatura". Botão do globo troca pra inglês.
- **Admin:** `/admin` — só entra com usuário e senha. Cadastra/edita/exclui miniaturas, troca status, escolhe o carro do topo, ordem da estante, marcas e textos do site.

Feito com Next.js 15 + Supabase (banco e fotos). Hospedagem na Vercel.

---

## 1. Banco de dados (Supabase)

1. Entre em <https://supabase.com> → **New project**. Escolha um nome, uma senha forte pro banco e a região **South America (São Paulo)**.
2. Quando o projeto terminar de criar, abra **SQL Editor** → **New query**.
3. Abra o arquivo `supabase/schema.sql` deste projeto, copie tudo, cole lá e clique em **Run**. Tem que aparecer "Success".
   - Isso cria as tabelas, o lugar das fotos (bucket `fotos`), as 8 marcas e as 5 miniaturas de exemplo.
   - Pode rodar de novo sem medo: não duplica nada.
4. Vá em **Project Settings → API Keys** (ou **Data API**) e copie:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **service_role** key (ou a **Secret key**, que começa com `sb_secret_`).

> ⚠️ A service_role/secret key dá acesso total ao banco. Ela só vai na Vercel. Nunca coloque no código, no GitHub nem mande em mensagem.

## 2. Publicar (Vercel)

1. Entre em <https://vercel.com> com a sua conta do GitHub → **Add New → Project** → importe o repositório `scale-garage-64`.
2. Antes de clicar em Deploy, abra **Environment Variables** e cadastre as 5 variáveis:

| Nome | O que colocar |
| --- | --- |
| `SUPABASE_URL` | Project URL do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key do Supabase |
| `ADMIN_USER` | usuário que vocês vão usar no admin |
| `ADMIN_PASSWORD` | senha do admin (forte, só vocês sabem) |
| `AUTH_SECRET` | uma sequência aleatória de pelo menos 32 caracteres (gere num gerador de senhas) |

3. Clique em **Deploy**. Quando terminar, a Vercel mostra o link do site.
4. Admin: abra `seu-link.vercel.app/admin`.

Se mudar alguma variável depois, vá em **Deployments → ⋯ → Redeploy** pra valer.

## 3. Usando o admin

- **Miniaturas:** "+ Nova miniatura". Foto em PNG com fundo transparente fica melhor (a borda vazia é cortada sozinha e a foto é diminuída antes de enviar). O número do catálogo é dado na hora de salvar e nunca é reaproveitado.
- **Marca "Outra…":** se a marca não estiver na lista, escolha "Outra…" e digite. Pra ela aparecer na grade de marcas do site, cadastre em **Marcas**.
- **Detalhes (Explorar):** depois de escolher a foto, clique em cima de um farol, roda etc. pra criar os atalhos de zoom.
- **Destaques:** carro que gira no topo do site e ordem da estante.
- **Textos do site:** Instagram, "colecionando desde", os 3 textos do topo e o texto da importação, em português e inglês.

As mudanças aparecem no site na próxima vez que a página for aberta.

## Rodar no computador (opcional)

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev                  # http://localhost:3000
```

Sem as variáveis do Supabase o site abre com as miniaturas de exemplo e o admin avisa que nada é salvo.
