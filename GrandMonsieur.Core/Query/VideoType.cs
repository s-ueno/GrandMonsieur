using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GrandMonsieur.Core
{
    public enum VideoType
    {
        Youtube = 1 << 0,
        Dailymotion = 1 << 1,
        Niconico = 1 << 2,
        Bilibili = 1 << 3
    }
}
