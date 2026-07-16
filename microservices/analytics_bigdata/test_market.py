import sys
import codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
sys.stderr = sys.stdout

import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'))

from engine import AnalyticsEngine

engine = AnalyticsEngine()
engine.resilience_mode = False
engine._safe_initialize_spark()

try:
    print("Running run_event_market_gaps_pca...")
    res = engine.run_event_market_gaps_pca(filters={"manager_id": 1})
    print("Result:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
    print("ERROR CAUGHT:", type(e).__name__, str(e))

import os; os._exit(0)
