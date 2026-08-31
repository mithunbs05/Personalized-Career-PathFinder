// AI Mentor — Shared Engineering Skill Data
// Covers the comprehensive Engineering Taxonomy across major disciplines

import { SkillCluster } from '../types/roadmap';

export const SKILL_CLUSTERS: SkillCluster[] = [
  {
    id: 'c1',
    categoryName: 'Artificial Intelligence & ML',
    description: 'Statistical learning, Deep Learning, NLP, Computer Vision & Transformers.',
    skills: [
      {
        id: 's1',
        name: 'Machine Learning Foundations',
        level: 'Advanced',
        progress: 85,
        isVerified: true,
        verificationDetails: { courseName: 'Applied Machine Learning', labScore: 92, assessmentScore: 88 }
      },
      {
        id: 's2',
        name: 'Deep Neural Networks (PyTorch)',
        level: 'Proficient',
        progress: 78,
        isVerified: true,
        verificationDetails: { courseName: 'Deep Learning Specialization', labScore: 85, assessmentScore: 80 }
      },
      {
        id: 's3',
        name: 'Generative AI & LLMs',
        level: 'Developing',
        progress: 60,
        isVerified: false,
      }
    ]
  },
  {
    id: 'c2',
    categoryName: 'Embedded Systems & Firmware',
    description: 'Embedded C/C++, ARM Cortex-M, RTOS, and communication protocols.',
    skills: [
      {
        id: 's4',
        name: 'Embedded C & Memory Systems',
        level: 'Advanced',
        progress: 90,
        isVerified: true,
        verificationDetails: { courseName: 'Embedded Systems Architecture', assessmentScore: 92 }
      },
      {
        id: 's5',
        name: 'ARM Cortex-M & Peripheral Protocols (I2C/SPI/UART)',
        level: 'Proficient',
        progress: 82,
        isVerified: true,
        verificationDetails: { courseName: 'Microcontroller Interfacing', assessmentScore: 85 }
      },
      {
        id: 's6',
        name: 'Real-Time Operating Systems (FreeRTOS)',
        level: 'Developing',
        progress: 55,
        isVerified: false,
      }
    ]
  },
  {
    id: 'c3',
    categoryName: 'Cybersecurity & Infrastructure',
    description: 'Network protocols, penetration testing, cryptography, and cloud security.',
    skills: [
      {
        id: 's7',
        name: 'Network Security & Packet Analysis',
        level: 'Proficient',
        progress: 75,
        isVerified: true,
        verificationDetails: { courseName: 'Network Defense & Analysis', assessmentScore: 80 }
      },
      {
        id: 's8',
        name: 'Ethical Hacking & Web Security (OWASP)',
        level: 'Developing',
        progress: 50,
        isVerified: false,
      }
    ]
  },
  {
    id: 'c4',
    categoryName: 'Robotics & Autonomous Systems',
    description: 'ROS2 architecture, kinematics, SLAM navigation, and motor control.',
    skills: [
      {
        id: 's9',
        name: 'ROS2 Architecture & Node Interfacing',
        level: 'Proficient',
        progress: 75,
        isVerified: true,
        verificationDetails: { courseName: 'Modern Robotics with ROS2', assessmentScore: 78 }
      },
      {
        id: 's10',
        name: 'Sensor Fusion & SLAM Navigation',
        level: 'Developing',
        progress: 45,
        isVerified: false,
      }
    ]
  },
  {
    id: 'c5',
    categoryName: 'Cloud & DevOps Engineering',
    description: 'Linux systems administration, Docker containerization, and Kubernetes orchestration.',
    skills: [
      {
        id: 's11',
        name: 'Linux Administration & Scripting',
        level: 'Advanced',
        progress: 88,
        isVerified: true,
        verificationDetails: { courseName: 'Linux Professional Institute Certification', assessmentScore: 90 }
      },
      {
        id: 's12',
        name: 'Kubernetes & CI/CD Pipelines',
        level: 'Developing',
        progress: 60,
        isVerified: false,
      }
    ]
  }
];
