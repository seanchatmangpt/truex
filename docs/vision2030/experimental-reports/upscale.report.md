# Experimental Project Report: upscale

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/upscale`

## 1. Audit Status
- **Test Status:** ⚠️ No Tests Found / Not Executable

## 2. Executable Entry Points
- `upscale/scripts/parallel_upscale.sh`

## 3. Extracted Documentation & Context
### Source: `upscale/README.md`
```markdown
# Real-ESRGAN Upscaler Setup

This directory contains a configured Real-ESRGAN installation for easy image upscaling.

## Quick Start

The `upscale` command is now available in your PATH (after restarting your terminal or running `source ~/.zshrc`).

### Basic Usage

```bash
# Upscale a single image (4x by default)
upscale image.jpg

# Upscale with anime model
upscale anime_image.png --anime

# Upscale with custom output directory
upscale image.jpg -o /path/to/output/

# Upscale with custom scale
upscale image.jpg -s 2

# Upscale entire folder
upscale /path/to/images/ -o /path/to/output/

# Enable face enhancement (uses GFPGAN)
upscale portrait.jpg --face-enhance
```

### Available Options

- `--model, -m`: Model to use (default: RealESRGAN_x4plus)
  - `RealESRGAN_x4plus`: General purpose model (default)
  - `RealESRGAN_x4plus_anime_6B`: Optimized for anime images
- `--anime, -a`: Shortcut to use anime model
- `--scale, -s`: Upscaling factor (default: 4.0)
- `--output, -o`: Output directory (default: <input>_upscaled)
- `--face-enhance, -f`: Use GFPGAN to enhance faces
- `--tile, -t`: Tile size for large images (reduces memory usage, 0=auto)
...
```

### Source: `upscale/Real-ESRGAN/CODE_OF_CONDUCT.md`
```markdown
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, religion, or sexual identity
and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our
community include:

* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
* Focusing on what is best not just for us as individuals, but for the
  overall community

Examples of unacceptable behavior include:

* The use of sexualized language or imagery, and sexual attention or
  advances of any kind
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or email
  address, without their explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Enforcement Responsibilities

...
```

### Source: `upscale/Real-ESRGAN/README.md`
```markdown
<p align="center">
  <img src="assets/realesrgan_logo.png" height=120>
</p>

## <div align="center"><b><a href="README.md">English</a> | <a href="README_CN.md">简体中文</a></b></div>

<div align="center">

👀[**Demos**](#-demos-videos) **|** 🚩[**Updates**](#-updates) **|** ⚡[**Usage**](#-quick-inference) **|** 🏰[**Model Zoo**](docs/model_zoo.md) **|** 🔧[Install](#-dependencies-and-installation)  **|** 💻[Train](docs/Training.md) **|** ❓[FAQ](docs/FAQ.md) **|** 🎨[Contribution](docs/CONTRIBUTING.md)

[![download](https://img.shields.io/github/downloads/xinntao/Real-ESRGAN/total.svg)](https://github.com/xinntao/Real-ESRGAN/releases)
[![PyPI](https://img.shields.io/pypi/v/realesrgan)](https://pypi.org/project/realesrgan/)
[![Open issue](https://img.shields.io/github/issues/xinntao/Real-ESRGAN)](https://github.com/xinntao/Real-ESRGAN/issues)
[![Closed issue](https://img.shields.io/github/issues-closed/xinntao/Real-ESRGAN)](https://github.com/xinntao/Real-ESRGAN/issues)
[![LICENSE](https://img.shields.io/github/license/xinntao/Real-ESRGAN.svg)](https://github.com/xinntao/Real-ESRGAN/blob/master/LICENSE)
[![python lint](https://github.com/xinntao/Real-ESRGAN/actions/workflows/pylint.yml/badge.svg)](https://github.com/xinntao/Real-ESRGAN/blob/master/.github/workflows/pylint.yml)
[![Publish-pip](https://github.com/xinntao/Real-ESRGAN/actions/workflows/publish-pip.yml/badge.svg)](https://github.com/xinntao/Real-ESRGAN/blob/master/.github/workflows/publish-pip.yml)

</div>

🔥 **AnimeVideo-v3 model (动漫视频小模型)**. Please see [[*anime video models*](docs/anime_video_model.md)] and [[*comparisons*](docs/anime_comparisons.md)]<br>
🔥 **RealESRGAN_x4plus_anime_6B** for anime images **(动漫插图模型)**. Please see [[*anime_model*](docs/anime_model.md)]

<!-- 1. You can try in our website: [ARC Demo](https://arc.tencent.com/en/ai-demos/imgRestore) (now only support RealESRGAN_x4plus_anime_6B) -->
1. :boom: **Update** online Replicate demo: [![Replicate](https://img.shields.io/static/v1?label=Demo&message=Replicate&color=blue)](https://replicate.com/xinntao/realesrgan)
1. Online Colab demo for Real-ESRGAN: [![Colab](https://img.shields.io/static/v1?label=Demo&message=Colab&color=orange)](https://colab.research.google.com/drive/1k2Zod6kSHEvraybHl50Lys0LerhyTMCo?usp=sharing) **|** Online Colab demo for for Real-ESRGAN (**anime videos**): [![Colab](https://img.shields.io/static/v1?label=Demo&message=Colab&color=orange)](https://colab.research.google.com/drive/1yNl9ORUxxlL4N0keJa2SEPB61imPQd1B?usp=sharing)
1. Portable [Windows](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip) / [Linux](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-ubuntu.zip) / [MacOS](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-macos.zip) **executable files for Intel/AMD/Nvidia GPU**. You can find more information [here](#portable-executable-files-ncnn). The ncnn implementation is in [Real-ESRGAN-ncnn-vulkan](https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan)
<!-- 1. You can watch enhanced animations in [Tencent Video](https://v.qq.com/s/topic/v_child/render/fC4iyCAM.html). 欢迎观看[腾讯视频动漫修复](https://v.qq.com/s/topic/v_child/render/fC4iyCAM.html) -->

Real-ESRGAN aims at developing **Practical Algorithms for General Image/Video Restoration**.<br>
We extend the powerful ESRGAN to a practical restoration application (namely, Real-ESRGAN), which is trained with pure synthetic data.

🌌 Thanks for your valuable feedbacks/suggestions. All the feedbacks are updated in [feedback.md](docs/feedback.md).

---

If Real-ESRGAN is helpful, please help to ⭐ this repo or recommend it to your friends 😊 <br>
Other recommended projects:<br>
▶️ [GFPGAN](https://github.com/TencentARC/GFPGAN): A practical algorithm for real-world face restoration <br>
▶️ [BasicSR](https://github.com/xinntao/BasicSR): An open-source image and video restoration toolbox<br>
...
```

*(Plus 13 other markdown files)*
