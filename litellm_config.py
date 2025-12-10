"""
LiteLLM Configuration for handling GPT-5 model parameters
"""
import os
import litellm

# Read from environment variables with defaults
drop_params = os.getenv('LITELLM_DROP_PARAMS', 'True').lower() == 'true'
set_verbose = os.getenv('LITELLM_VERBOSE', 'False').lower() == 'true'

# Enable dropping of unsupported parameters for GPT-5 models
litellm.drop_params = drop_params

# Optional: Set logging level for debugging
litellm.set_verbose = set_verbose

print(f"LiteLLM initialized with drop_params = {litellm.drop_params}, verbose = {litellm.set_verbose}")
