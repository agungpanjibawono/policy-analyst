# 🏛️ AI Policy Knowledge Management System - The Old Documentation

*Catatan: Ini adalah dokumentasi lama yang saya simpan untuk nostalgia dan reference. Dokumentasi terbaru ada di README.md utama.*

## 📖 **Cerita di Balik Project Ini**

Awalnya kepikiran, kenapa ya riset policy sama drafting kebijakan masih manual banget? Padahal teknologi AI udah canggih. Jadilah bikin sistem yang bisa bantu analyst policy dan pembuat kebijakan dengan AI.

## 🎯 **Fitur Utama yang Berhasil Dibikin**

### 1. 🔍 **Policy Q&A Engine (RAG-based) - Yang paling saya bangga**
- **Natural language queries** dalam Bahasa Indonesia (ini challenging!)
- **Semantic search** lewat dokumen policy  
- **Contextual answers** dengan citation sumber yang jelas
- **Real-time responses** dengan confidence scoring (ini yang paling lama di-debug)

### 2. ✍️ **Policy Drafting Assistant - Eksperimen yang berhasil**
- **AI-powered drafting** berdasarkan topik dan requirement
- **Template suggestions** berdasarkan jenis policy
- **Best practice recommendations** dari knowledge base
- **Compliance checking** terhadap policy yang udah ada

### 3. 📤 **Document Upload & Processing - Yang bikin pusing**
- **Multi-format support**: PDF, DOCX, TXT (parsing PDF itu nightmare)
- **Automatic text extraction** dan chunking yang smart
- **Metadata tagging** dan kategorisasi otomatis
- **Vector indexing** buat retrieval yang cepet

### 4. 📊 **Smart Analytics - Fitur bonus**
- **Policy effectiveness** metrics
- **Gap analysis** antar policy
- **Usage statistics** dan trend analysis
- **Compliance reporting** otomatis

## 🛠️ **Tech Stack yang Saya Pilih (Dan Kenapa)**

- **Backend**: FastAPI + Python 3.10+ (cepet banget buat development)
- **Vector Database**: ChromaDB untuk RAG (setup-nya gampang)
- **LLM**: Llama API (3.3-70B-Instruct) (performanya mantap buat Indonesian)
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS (modern stack yang reliable)
- **Embeddings**: HuggingFace Sentence Transformers (gratis dan bagus)
- **Document Processing**: LangChain + PyPDF2 (combo yang work)

## 🚀 **Quick Start - Cara Install**

### 1. **Clone dan Setup**
```bash
git clone <repository>
cd llama-hactiv8
```

### 2. **Environment Configuration**
```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env dan tambahin LLAMA_API_KEY kamu

# Frontend configuration (udah di-set)
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py
# Server runs on http://localhost:8000
```

### 4. Run Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# Frontend runs on http://localhost:3000
```

### 5. Load Sample Data
```bash
cd backend
python load_sample_data.py
```

## 📋 API Endpoints

### Policy Q&A
- `POST /api/qa/ask` - Ask questions about policies
- `GET /api/qa/search` - Search policies by keyword

### Document Management
- `POST /api/policies/upload` - Upload policy documents
- `GET /api/policies/` - List all policies
- `DELETE /api/policies/{id}` - Delete policy

### Policy Drafting
- `POST /api/drafting/draft` - Generate policy draft
- `POST /api/drafting/analyze` - Analyze policy compliance
- `GET /api/drafting/templates` - Get policy templates

## 📊 Use Cases

### 🏛️ Government Agencies
- Policy research and analysis
- Regulatory compliance checking
- Public policy drafting assistance
- Inter-agency policy coordination

### 🏢 Corporate Organizations
- Internal policy management
- HR policy development
- Compliance documentation
- Employee policy queries

### ⚖️ Legal Firms
- Policy analysis and review
- Regulatory compliance consulting
- Legal document drafting
- Client advisory services

### 🎓 Academic Institutions
- Policy research and studies
- Educational material development
- Student policy assistance
- Research collaboration

## 🏗️ Project Structure

```
llama-hactiv8/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── api/                    # API route handlers
│   │   ├── qa_routes.py        # Q&A endpoints
│   │   ├── policy_routes.py    # Document management
│   │   └── drafting_routes.py  # Policy drafting
│   ├── services/               # Business logic
│   │   ├── vector_store.py     # ChromaDB integration
│   │   ├── llm_service.py      # Llama API integration
│   │   └── document_processor.py # Document parsing
│   ├── models/                 # Pydantic data models
│   │   └── schemas.py          # API schemas
│   ├── utils/                  # Helper utilities
│   │   └── logger.py           # Logging configuration
│   ├── data/                   # Data storage
│   │   ├── chroma_db/          # Vector database
│   │   └── sample_*.txt        # Sample policies
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx            # Home page
│   │   ├── qa/page.tsx         # Q&A interface
│   │   ├── upload/page.tsx     # Document upload
│   │   ├── draft/page.tsx      # Policy drafting
│   │   ├── layout.tsx          # App layout
│   │   └── globals.css         # Global styles
│   ├── package.json            # Node.js dependencies
│   ├── tailwind.config.js      # Tailwind configuration
│   └── tsconfig.json           # TypeScript configuration
└── README.md                   # This file
```

## 📈 Feature Status

- [x] ✅ Project setup and structure
- [x] ✅ FastAPI backend with CORS
- [x] ✅ Vector database integration (ChromaDB)
- [x] ✅ LLM service integration (Llama API)
- [x] ✅ Document upload and processing
- [x] ✅ Policy Q&A with RAG
- [x] ✅ Policy drafting assistant
- [x] ✅ Next.js frontend with TypeScript
- [x] ✅ Responsive UI with Tailwind CSS
- [x] ✅ Sample data and policies
- [ ] 🔄 Advanced analytics dashboard
- [ ] 🔄 User authentication and authorization
- [ ] 🔄 Policy version control
- [ ] 🔄 Multi-tenant support
- [ ] 🔄 Advanced search filters
- [ ] 🔄 Export functionality (PDF, Word)
- [ ] 🔄 Policy approval workflow
- [ ] 🔄 Integration with external systems

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```bash
LLAMA_API_KEY=your_llama_api_key_here
DATABASE_URL=postgresql://user:password@localhost/policy_db
CHROMA_DB_PATH=./data/chroma_db
DEBUG=True
LOG_LEVEL=INFO
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```


## 🎯 Roadmap

### Phase 1: Core Functionality ✅
- [x] Basic Q&A system with document upload
- [x] Policy drafting assistant
- [x] Document processing and indexing
- [x] Web interface

### Phase 2: Enhanced Features 🔄
- [ ] Advanced analytics dashboard
- [ ] User management and permissions
- [ ] Policy templates library
- [ ] Bulk document upload

### Phase 3: Enterprise Features 🔄
- [ ] Multi-language support (English, Bahasa)
- [ ] Policy approval workflows
- [ ] Integration APIs
- [ ] Advanced reporting

### Phase 4: AI Enhancements 🔄
- [ ] Automatic policy updates detection
- [ ] Policy impact prediction
- [ ] Advanced compliance checking
- [ ] Custom model fine-tuning

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- 📧 Email: support@ai-policy-manager.com
- 📖 Documentation: [docs.ai-policy-manager.com](https://docs.ai-policy-manager.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/ai-policy-manager/issues)

## 🙏 Acknowledgments

- Llama API for powerful language models
- ChromaDB for vector database capabilities
- HuggingFace for embedding models
- Next.js and FastAPI communities

## 📊 Use Cases

### 🏛️ Government Agencies
- Policy research and analysis
- Regulatory compliance checking
- Public policy drafting assistance
- Inter-agency policy coordination

### 🏢 Corporate Organizations
- Internal policy management
- HR policy development
- Compliance documentation
- Employee policy queries

### ⚖️ Legal Firms
- Policy analysis and review
- Regulatory compliance consulting
- Legal document drafting
- Client advisory services

### 🎓 Academic Institutions
- Policy research and studies
- Educational material development
- Student policy assistance
- Research collaboration

## 🏗️ Project Structure

```
ai-policy-manager/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── api/                    # API route handlers
│   │   ├── qa_routes.py        # Q&A endpoints
│   │   ├── policy_routes.py    # Document management
│   │   └── drafting_routes.py  # Policy drafting
│   ├── services/               # Business logic
│   │   ├── vector_store.py     # ChromaDB integration
│   │   ├── llm_service.py      # Llama API integration
│   │   └── document_processor.py # Document parsing
│   ├── models/                 # Pydantic data models
│   │   └── schemas.py          # API schemas
│   ├── utils/                  # Helper utilities
│   │   └── logger.py           # Logging configuration
│   ├── data/                   # Data storage
│   │   ├── chroma_db/          # Vector database
│   │   └── sample_*.txt        # Sample policies
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx            # Home page
│   │   ├── qa/page.tsx         # Q&A interface
│   │   ├── upload/page.tsx     # Document upload
│   │   ├── draft/page.tsx      # Policy drafting
│   │   ├── layout.tsx          # App layout
│   │   └── globals.css         # Global styles
│   ├── package.json            # Node.js dependencies
│   ├── tailwind.config.js      # Tailwind configuration
│   └── tsconfig.json           # TypeScript configuration
├── setup.sh                   # Automated setup script
└── README.md                   # This file
```

## 📈 Features Status

- [x] ✅ Project setup and structure
- [x] ✅ FastAPI backend with CORS
- [x] ✅ Vector database integration (ChromaDB)
- [x] ✅ LLM service integration (Llama API)
- [x] ✅ Document upload and processing
- [x] ✅ Policy Q&A with RAG
- [x] ✅ Policy drafting assistant
- [x] ✅ Next.js frontend with TypeScript
- [x] ✅ Responsive UI with Tailwind CSS
- [x] ✅ Sample data and policies
- [x] ✅ Automated setup script
- [ ] 🔄 Advanced analytics dashboard
- [ ] 🔄 User authentication and authorization
- [ ] 🔄 Policy version control
- [ ] 🔄 Multi-tenant support
- [ ] 🔄 Advanced search filters
- [ ] 🔄 Export functionality (PDF, Word)
- [ ] 🔄 Policy approval workflow
- [ ] 🔄 Integration with external systems

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```bash
LLAMA_API_KEY=your_llama_api_key_here
DATABASE_URL=postgresql://user:password@localhost/policy_db
CHROMA_DB_PATH=./data/chroma_db
DEBUG=True
LOG_LEVEL=INFO
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Sample Policies Included

1. **Kebijakan Work From Home**
   - Category: HR
   - Type: Policy
   - Language: Indonesian

2. **Kebijakan Cuti Karyawan** 
   - Category: HR
   - Type: Policy
   - Language: Indonesian

## 🎯 Roadmap

### Phase 1: Core Functionality ✅
- [x] Basic Q&A system with document upload
- [x] Policy drafting assistant
- [x] Document processing and indexing
- [x] Web interface

### Phase 2: Enhanced Features 🔄
- [ ] Advanced analytics dashboard
- [ ] User management and permissions
- [ ] Policy templates library
- [ ] Bulk document upload

### Phase 3: Enterprise Features 🔄
- [ ] Multi-language support (English, Bahasa)
- [ ] Policy approval workflows
- [ ] Integration APIs
- [ ] Advanced reporting

### Phase 4: AI Enhancements 🔄
- [ ] Automatic policy updates detection
- [ ] Policy impact prediction
- [ ] Advanced compliance checking
- [ ] Custom model fine-tuning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- 📧 Email: support@ai-policy-manager.com
- 📖 Documentation: [docs.ai-policy-manager.com](https://docs.ai-policy-manager.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/ai-policy-manager/issues)

## 🙏 Acknowledgments

- Llama API for powerful language models
- ChromaDB for vector database capabilities
- HuggingFace for embedding models
- Next.js and FastAPI communities
