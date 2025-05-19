# 📦 Código Fonte - StockIT

Este diretório contém o código-fonte do projeto **StockIT**, incluindo tanto a interface web (front-end) quanto o back-end baseado em JSON Server.

---

## 👤 Repositórios Individuais

Abaixo estão os repositórios das pastas pessoais dos integrantes da equipe:

- [Arthur Henrique Tristão Pinto](https://github.com/ICEI-PUC-Minas-CC-TI/ti1-2025-1-t2-manha-gerenciaralimentos/tree/master/codigo/pastas%20pessoais/arthur)
- [Davi Rafael de Oliveira Gurgel Martins](https://github.com/ICEI-PUC-Minas-CC-TI/ti1-2025-1-t2-manha-gerenciaralimentos/tree/master/codigo/pastas%20pessoais/davi)
- [Diego Cunha da Silva](https://github.com/ICEI-PUC-Minas-CC-TI/ti1-2025-1-t2-manha-gerenciaralimentos/tree/master/codigo/pastas%20pessoais/diego)
- [Gabriel Pereira Couto Rodrigues](https://github.com/ICEI-PUC-Minas-CC-TI/ti1-2025-1-t2-manha-gerenciaralimentos/tree/master/codigo/pastas%20pessoais/gabriel)
- [Guilherme Augusto Vieira Pinto](https://github.com/ICEI-PUC-Minas-CC-TI/ti1-2025-1-t2-manha-gerenciaralimentos/tree/master/codigo/pastas%20pessoais/guilherme)
- [Raphael Lucas Ribeiro de Paula](https://github.com/ICEI-PUC-Minas-CC-TI/ti1-2025-1-t2-manha-gerenciaralimentos/tree/master/codigo/pastas%20pessoais/raphael)

---

## 📁 Estrutura de Diretórios

```plaintext
codigo/
│
├── db/
│   └── db.json                # Estrutura de dados simulada via JSON Server
│
├── pastas pessoais/           # Pastas Individuaias para desenvolvimento
│   ├── arthur
│   ├── davi
│   ├── diego
│   ├── gabriel
│   ├── guilherme
│   └── raphael
│
├── public/                   # Front-end do projeto
│   ├── assets/
│   │   ├── css/              # Estilos personalizados (CSS)
│   │   ├── js/               # Scripts de funcionalidades
│   │   ├── images/           # Imagens do projeto
│   │   └── fonts/            # Fontes utilizadas
│   ├── modulos/              # Telas específicas ou funcionalidades
│   ├── index.html            # Página inicial da aplicação
│   └── (outras páginas)      # Páginas complementares
│
├── index.js                  # Inicialização do JSON Server com Node.js
├── package.json              # Configuração do ambiente Node.js
└── README.md                 # Este arquivo
```
## 🌐 Front-End

A aplicação StockIT possui sua interface desenvolvida em **HTML5**, **CSS3** e **JavaScript**. O front-end está localizado na pasta `public/`, e é responsável por toda a visualização e interação do usuário.

### Estrutura

- **HTML5:** Responsável pela estrutura e marcação das páginas.
- **CSS3:** Utilizado para estilização e responsividade da interface.
- **JavaScript (puro):** Manipula dinamicamente os dados, realiza chamadas para a API (fetch) e aplica lógicas de ordenação, busca, filtros e validações.

### Organização

- `public/assets/css/`: Arquivos de estilo.
- `public/assets/js/`: Lógica e scripts de funcionalidade.
- `public/assets/images/`: Logotipos e imagens visuais.
- `public/index.html`: Página inicial da aplicação.
- `public/modulos/`: Páginas ou funcionalidades específicas (ex: ambiente, lista, receitas).

---

## 🔧 Back-End

O projeto utiliza o **JSON Server** como solução de back-end fake, simulando uma API RESTful com persistência de dados em um arquivo `.json`.

### Estrutura

- `db/db.json`: Arquivo com todos os dados simulados da aplicação (alimentos, ambientes, listas de compras etc).
- `index.js`: Inicializa o servidor JSON Server via Node.js.
- `package.json`: Gerencia as dependências do projeto (inclui json-server como dependência).

### Execução Local

Para rodar o back-end localmente:

```bash
npm install    # Instala as dependências do projeto
npm start      # Inicia o JSON Server em http://localhost:3000
