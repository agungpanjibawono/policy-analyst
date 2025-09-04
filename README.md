# 🦙 AI Policy Knowledge Management System

Sistem manajemen pengetahuan kebijakan berbasis AI untuk organisasi pemerintahan. Menggunakan LLM dan vector search untuk menjawab pertanyaan tentang kebijakan, peraturan, dan dokumen hukum.

## ✨ Features

- **🔍 Intelligent Q&A**: Tanya jawab cerdas tentang kebijakan dan peraturan
- **📊 Policy Analytics**: Analisis dan insight dari dokumen kebijakan
- **📝 Policy Drafting Assistant**: Bantuan penyusunan kebijakan baru
- **🎯 High Precision**: Sistem filtering yang akurat untuk menghindari jawaban yang salah
- **⚡ Fast Response**: Optimized vector search dan LLM processing
- **🌐 Modern UI**: Interface yang user-friendly dengan Next.js

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - LLM orchestration
- **FAISS** - Vector database for semantic search
- **Ollama/Llama3** - Local LLM deployment
- **Sentence Transformers** - Text embedding

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Ollama (for local LLM)

### Installation

1. **Clone repository**
   ```bash
   git clone <your-repo-url>
   cd llama-hactiv8
   ```

2. **Setup Backend**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # Linux/Mac
   # or
   .venv\Scripts\activate     # Windows
   
   pip install -r requirements.txt
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Setup Environment**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit .env file with your configurations
   
   # Frontend
   cp frontend/.env.local.example frontend/.env.local
   ```

5. **Install Ollama & Models**
   ```bash
   # Install Ollama (see: https://ollama.ai)
   ollama pull llama3:latest
   ```

### Running the Application

1. **Start Backend**
   ```bash
   cd backend
   source .venv/bin/activate
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 📊 Configuration & Tuning

### Performance Tuning

The system includes several configurable parameters for optimal performance:

```python
# In backend/services/pipeline_service.py

# Distance threshold for vector search (lower = more strict)
distance_threshold = 10.0  # Adjust 8.0-15.0

# Confidence threshold (higher = more strict)
confidence_threshold = 0.4  # Adjust 0.3-0.5

# Pre-filtering threshold  
pre_filter_threshold = 8.0  # Adjust 5.0-12.0
```

### Document Types Priority

```python
# Document type relevance weighting
type_relevance = {
    'undang-undang': 1.0,        # Highest priority
    'peraturan-pemerintah': 0.9,
    'peraturan-menteri': 0.8,
    'peraturan-daerah': 0.7,
    'policy': 0.6
}
```

## 📁 Project Structure

```
├── backend/
│   ├── api/                 # FastAPI routes
│   ├── services/            # Core business logic
│   ├── models/              # Data models
│   ├── utils/               # Utilities
│   └── data/                # Document storage
├── frontend/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   └── public/              # Static assets
├── docs/                    # Documentation
└── docs/examples/           # Sample documents
```

## 🎯 Usage Examples

### Basic Q&A
```bash
curl -X POST "http://localhost:8000/api/qa/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Jelaskan tentang jabatan fungsional analis kebijakan",
    "language": "id"
  }'
```

### Advanced Query with Task Type
```bash
curl -X POST "http://localhost:8000/api/qa/ask-advanced" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Ringkas peraturan tentang ASN",
    "task_type": "summarization"
  }'
```

## 🔧 API Endpoints

### Core Endpoints
- `POST /api/qa/ask` - Basic Q&A
- `POST /api/qa/ask-advanced` - Advanced Q&A with task types
- `GET /api/policies/documents` - List documents
- `POST /api/policies/upload` - Upload new documents

### Utility Endpoints
- `GET /health` - Health check
- `GET /api/stats` - System statistics
- `GET /api/qa/optimization-status` - Optimization status

## 🎨 Frontend Features

- **🎯 Intelligent Query Interface**: Smart input with suggestions
- **📊 Results Dashboard**: Confidence scores and source documents
- **📈 Analytics View**: System performance metrics
- **🔍 Document Explorer**: Browse uploaded documents
- **⚙️ Admin Panel**: System configuration and monitoring

## 🛡️ Production Considerations

### Security
- Add authentication middleware
- Configure CORS properly
- Use environment variables for sensitive data
- Implement rate limiting

### Performance
- Use Redis for caching
- Configure vector database optimization
- Implement request queuing for high load
- Monitor response times and accuracy

### Monitoring
- Add logging and metrics collection
- Set up health checks
- Monitor vector database performance
- Track query accuracy over time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LangChain** - For LLM orchestration framework
- **FAISS** - For efficient vector search
- **Ollama** - For local LLM deployment
- **Shadcn/ui** - For beautiful UI components

---

**Made with 🦙 LLAMA** - Intelligent Policy Management System
