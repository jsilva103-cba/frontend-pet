Projeto –Pets e Tutores  
Vaga: Engenheiro de Software  
Órgão: Governo do Estado de Mato Grosso – SEPLAG  
Candidato: Jeferson Araujo Silva  
CPF: 034.619.941-70

Descrição do Projeto
Este projeto consiste em uma **SPA (Single Page Application)** desenvolvida em **React + TypeScript**, cujo objetivo é consumir uma **API pública de registro de Pets e seus Tutores**, permitindo listagem, visualização detalhada e operações de CRUD, conforme edital.
Arquitetura
O projeto segue uma arquitetura em camadas, organizada da seguinte forma:

src/
├─ pages/ # Páginas (Pets, Tutores, Login, Detalhes, Create/Edit)
├─ services/ # Camada de acesso à API (axios)
├─ models/ # Tipagens (Pet, Tutor)
├─ routes/ # Rotas com Lazy Loading
├─ state/ # Facade de autenticação
├─ config/ # Configuração centralizada da API
└─ components/ # Componentes reutilizáveis (Forms, etc)


 Padrões adotados
- **Facade Pattern** para autenticação (`authFacade`)
- **Services** para encapsular regras de comunicação com a API
- **Form reutilizável** para Create e Edit
- **Lazy Loading de rotas** (React.lazy + Suspense)
- **Fallbacks defensivos** para variações de payload da API



Tecnologias Utilizadas

- **React 18**
- **TypeScript**
- **React Router DOM**
- **Axios**
- **Tailwind CSS**
- **Vite**
- **API Swagger:**  
  https://pet-manager-api.geia.vip/q/swagger-ui/

Autenticação

- Login via endpoint `POST /autenticacao/login`
- Token armazenado em `localStorage`
- **Refresh automático de token** (`PUT /autenticacao/refresh`)
- Interceptor Axios para:
  - Anexar Bearer Token
  - Renovar token automaticamente em caso de `401`
  - Redirecionar para `/login` em falha de refresh

Funcionalidades Implementadas

1. Listagem de Pets 
  - Cards com:
  - Foto (quando existir)
  - Nome
  - Espécie
  - Idade
- Paginação (10 por página)

2. Detalhe do Pet 
- Exibição completa dos dados do pet
- Destaque visual do nome
- Foto
- Se houver tutor:
- Exibe nome e contato (telefone formatado)

3. Cadastro e Edição de Pet
- Campos:
  - Nome
  - Espécie
  - Idade
  - Raça

4. Listagem e Detalhe de Tutores 
- Detalhe do Tutor:
  - Nome
  - Telefone 
  - Endereço
  - Lista de pets vinculados
5. Cadastro e Edição de Tutor
- Campos:
  - Nome completo
  - Telefone
  - Endereço

6. Vinculação Pet–Tutor 
- Visualização e remoção do vínculo na tela do tutor


Como Executar o Projeto

Pré-requisitos
- Node.js 18+
- npm

Passos
bash
# instalar dependências
npm install

# rodar em ambiente local
npm run dev

Variáveis de ambiente: VITE_API_BASE_URL=https://pet-manager-api.geia.vip

Como Testar
1.	Acesse /login
2.	Autentique-se com credenciais válidas da API
3.	Navegue entre:
o	Pets
o	Detalhes
o	Cadastro/Edição
o	Tutores
o	Vínculo Pet–Tutor
4.	Teste:
o	Paginação
o	Upload de foto
o	Refresh automático de token
o	CRUD

